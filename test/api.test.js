import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import request from 'supertest';
import { iniciarMongoTemporal } from '../scripts/mongo-temporal.js';
import { MongoClient, ObjectId, BSON } from 'mongodb';
import { initDb } from '../src/db.js';
import { createApp } from '../src/app.js';
import { createUser } from '../src/auth.js';
import { scenarios } from './scenarios.js';
let repl, client, db, app;
const vars = {};
const results = [];
before(async () => {
  repl = await iniciarMongoTemporal();
  client = new MongoClient(repl.getUri()); await client.connect(); db = client.db('test_bd2'); await initDb(db); app = createApp(db, client);
  for (const rol of ['coordinador', 'tecnico', 'cliente']) {
    const u = await createUser(db, { nombreCompleto: rol, documento: rol, correo: rol + '@example.test', telefono: '3000000000', rol });
    vars[rol + 'Id'] = String(u._id); vars[rol + 'Token'] = u.token;
  }
  vars.futuro = new Date(Date.now() + 86400000).toISOString(); vars.futuro2 = new Date(Date.now() + 172800000).toISOString(); vars.entregaEstimada = new Date(Date.now() + 604800000).toISOString();
}, { timeout: 240000 });
after(async () => {
  await mkdir('docs/evidencias', { recursive: true });
  await writeFile('docs/evidencias/resultados-http.json', JSON.stringify({ generadoEn: new Date().toISOString(), motor: 'MongoDB temporal con replica set, Express y Supertest', casos: results }, null, 2));
  await client?.close(); await repl?.stop();
});
const substitute = value => JSON.parse(JSON.stringify(value).replace(/\{\{(\w+)\}\}/g, (_m, key) => { assert.ok(vars[key], `Falta variable ${key}`); return vars[key]; }));
test('Flujo funcional equivalente a Postman', async t => {
  for (const s of scenarios) await t.test(s.name, async () => {
    const call = request(app)[s.method.toLowerCase()]('/api' + substitute(s.path));
    if (s.role) call.set('Authorization', 'Bearer ' + vars[s.role + 'Token']);
    const response = s.body ? await call.send(substitute(s.body)) : await call;
    results.push({ caso: s.name, esperado: s.status, recibido: response.status, correcto: response.status === s.status });
    assert.equal(response.status, s.status, JSON.stringify(response.body));
    if (s.save) vars[s.save] = response.body._id;
    if (s.saveField) vars[s.saveField.key] = s.saveField.path.split('.').reduce((o, k) => o[k], response.body);
    for (const c of s.checks || []) assert.equal(response.body[c.field], c.equals);
  });
});
test('Integridad, permisos, conservación histórica y concurrencia', async t => {
  const auth = (method, path, rol = 'coordinador') => request(app)[method]('/api' + path).set('Authorization', 'Bearer ' + vars[rol + 'Token']);
  const samples = {};
  for (const name of ['usuarios', 'bicicletas', 'servicios', 'repuestos', 'citas', 'ordenesServicio', 'trabajosOrden', 'solicitudesGarantia']) {
    samples[name] = await db.collection(name).find().toArray();
    if (name === 'usuarios') samples[name] = samples[name].map(({ tokenHash, ...u }) => ({ ...u, tokenHash: 'HASH_OMITIDO_EN_DOCUMENTACION_' + u.rol }));
  }
  await mkdir('database', { recursive: true });
  await writeFile('database/documentos-ejemplo.extended.json', BSON.EJSON.stringify(samples, null, 2, { relaxed: false }));
  await t.test('Validador de MongoDB rechaza documentos incompletos en las ocho colecciones', async () => {
    for (const name of ['usuarios', 'bicicletas', 'servicios', 'repuestos', 'citas', 'ordenesServicio', 'trabajosOrden', 'solicitudesGarantia']) await assert.rejects(db.collection(name).insertOne({ incorrecto: true }), e => e.code === 121);
  });
  await t.test('Historial conserva descripción y repuestos originales; excluye rechazados de realizados', async () => {
    const r = await auth('get', `/bicicletas/${vars.bicicletaId}/historial`, 'cliente'); assert.equal(r.status, 200);
    const o = r.body.find(o => o._id === vars.ordenId); assert.equal(o.intervencionesRealizadas.length, 1); assert.equal(o.trabajos.length, 2);
    assert.equal(o.intervencionesRealizadas[0].ejecucion.repuestosUtilizados[0].nombre, 'Pastillas');
    assert.equal(o.intervencionesRealizadas[0].repuestosPrevistos[0].precioUnitarioEstimado, 20000);
    assert.equal(o.historialEstados.at(-1).estado, 'entregada');
  });
  await t.test('Otro cliente y un técnico no asignado no acceden a la orden', async () => {
    for (const rol of ['cliente', 'tecnico']) {
      const u = await createUser(db, { nombreCompleto: 'Otro ' + rol, documento: 'otro-' + rol, correo: 'otro-' + rol + '@example.test', telefono: '3000000001', rol });
      const r = await request(app).get('/api/ordenes/' + vars.ordenId).set('Authorization', 'Bearer ' + u.token); assert.equal(r.status, 403);
    }
  });
  await t.test('Solicitudes simultáneas no crean dos órdenes activas', async () => {
    const body = substitute(scenarios.find(s => s.name === 'Nueva recepción sin cita tras entrega').body);
    const responses = await Promise.all([auth('post', '/ordenes').send(body), auth('post', '/ordenes').send(body)]);
    assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
  });
  await t.test('Garantía vencida rechaza solicitud', async () => {
    await db.collection('trabajosOrden').updateOne({ _id: new ObjectId(vars.trabajoId) }, { $set: { 'garantia.fechaInicio': new Date(Date.now() - 40 * 86400000) } });
    const r = await auth('post', '/garantias/solicitudes', 'cliente').send({ trabajoId: vars.trabajoId, descripcion: 'Fuera de plazo' }); assert.equal(r.status, 409);
  });
  await t.test('ID mal formado y JSON roto devuelven 400', async () => {
    assert.equal((await auth('get', '/ordenes/no-es-id')).status, 400);
    assert.equal((await auth('post', '/bicicletas', 'cliente').set('Content-Type', 'application/json').send('{')).status, 400);
  });
});
