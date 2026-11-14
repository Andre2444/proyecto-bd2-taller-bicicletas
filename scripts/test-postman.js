import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import newman from 'newman';
import { initDb } from '../src/db.js';
import { createApp } from '../src/app.js';
import { createUser } from '../src/auth.js';
const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '7.0.14', downloadDir: '.local/mongodb-binaries' } });
const client = new MongoClient(repl.getUri());
let server;
try {
  await client.connect(); const db = client.db('postman_bd2'); await initDb(db);
  const values = [];
  for (const rol of ['coordinador', 'tecnico', 'cliente']) {
    const u = await createUser(db, { nombreCompleto: 'Demo ' + rol, documento: rol, correo: rol + '@example.test', telefono: '3000000000', rol });
    values.push({ key: rol + 'Id', value: String(u._id), enabled: true }, { key: rol + 'Token', value: u.token, enabled: true });
  }
  server = createApp(db, client).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  values.push({ key: 'baseUrl', value: `http://127.0.0.1:${server.address().port}/api`, enabled: true });
  const collection = JSON.parse(await readFile('postman/BD2.postman_collection.json', 'utf8'));
  const summary = await new Promise((resolve, reject) => newman.run({ collection, environment: { values }, reporters: ['cli'] }, (err, result) => err ? reject(err) : resolve(result)));
  // Guardar únicamente resultados, nunca peticiones completas con tokens.
  await mkdir('docs/evidencias', { recursive: true });
  await writeFile('docs/evidencias/resultados-postman.json', JSON.stringify({ generadoEn: new Date().toISOString(), herramienta: 'Newman (motor de ejecución de colecciones Postman)', estadisticas: summary.run.stats, errores: summary.run.failures.map(f => ({ caso: f.source?.name, mensaje: f.error?.message })) }, null, 2));
  if (summary.run.failures.length) process.exitCode = 1;
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  await client.close(); await repl.stop();
}
