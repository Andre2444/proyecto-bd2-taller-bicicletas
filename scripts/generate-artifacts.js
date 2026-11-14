import { mkdir, writeFile } from 'node:fs/promises';
import { scenarios } from '../test/scenarios.js';
import { schemas } from '../src/db.js';
await mkdir('postman', { recursive: true });
await mkdir('database', { recursive: true });
const collection = {
  info: { name: 'BD2 - Taller de bicicletas - Entrega 2', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json', description: 'Ejecutar en orden con usuarios de npm run seed o npm run demo. Usar una base nueva para repetir la secuencia. Contiene pruebas positivas y negativas.' },
  variable: [{ key: 'baseUrl', value: 'http://127.0.0.1:3000/api' }],
  event: [{ listen: 'prerequest', script: { type: 'text/javascript', exec: ["if (!pm.collectionVariables.get('futuro')) {", "  const now = Date.now();", "  pm.collectionVariables.set('futuro', new Date(now + 86400000).toISOString());", "  pm.collectionVariables.set('futuro2', new Date(now + 172800000).toISOString());", "  pm.collectionVariables.set('entregaEstimada', new Date(now + 604800000).toISOString());", '}'] } }],
  item: scenarios.map((s, i) => ({ name: `${String(i + 1).padStart(2, '0')} ${s.name}`, request: { method: s.method, header: [{ key: 'Content-Type', value: 'application/json' }, ...(s.role ? [{ key: 'Authorization', value: `Bearer {{${s.role}Token}}` }] : [])], url: '{{baseUrl}}' + s.path, ...(s.body ? { body: { mode: 'raw', raw: JSON.stringify(s.body, null, 2), options: { raw: { language: 'json' } } } } : {}) }, event: [{ listen: 'test', script: { type: 'text/javascript', exec: [`pm.test('HTTP ${s.status}', () => pm.response.to.have.status(${s.status}));`, ...(s.save ? [`if (pm.response.code === ${s.status}) pm.collectionVariables.set('${s.save}', pm.response.json()._id);`] : []), ...(s.saveField ? [`if (pm.response.code === ${s.status}) pm.collectionVariables.set('${s.saveField.key}', pm.response.json().${s.saveField.path});`] : []), ...(s.checks || []).map(c => `pm.test('${c.field}', () => pm.expect(pm.response.json().${c.field}).to.eql(${JSON.stringify(c.equals)}));`)] } }] }))
};
await writeFile('postman/BD2.postman_collection.json', JSON.stringify(collection, null, 2));
await writeFile('postman/local.postman_environment.json', JSON.stringify({ name: 'BD2 - completar con credenciales locales', values: ['baseUrl', 'coordinadorToken', 'coordinadorId', 'tecnicoToken', 'tecnicoId', 'clienteToken', 'clienteId'].map(key => ({ key, value: key === 'baseUrl' ? 'http://127.0.0.1:3000/api' : '', enabled: true })), _postman_variable_scope: 'environment' }, null, 2));
await writeFile('database/esquemas.mongodb.json', JSON.stringify(schemas, null, 2));
await writeFile('database/crear-colecciones.mongosh.js', '// Ejecutar sobre una base nueva seleccionada con use taller_bicicletas.\n// Los índices completos se instalan con npm run db:init.\nconst schemas = ' + JSON.stringify(schemas, null, 2) + ';\nfor (const [name, schema] of Object.entries(schemas)) { db.createCollection(name, {validator: {$jsonSchema: schema}, validationLevel: "moderate", validationAction: "error"}); }\n');
console.log(`Generados ${scenarios.length} casos Postman y esquemas de ocho colecciones.`);
