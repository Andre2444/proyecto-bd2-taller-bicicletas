import { iniciarMongoTemporal } from './mongo-temporal.js';
import { MongoClient } from 'mongodb';
import { initDb } from '../src/db.js';
import { createApp } from '../src/app.js';
import { seed } from './seed.js';
// Instancia real y temporal de MongoDB. Para conservar datos, usar npm start
// con un replica set persistente o MongoDB Atlas.
const repl = await iniciarMongoTemporal();
const client = new MongoClient(repl.getUri());
await client.connect();
const db = client.db('taller_demo');
await initDb(db);
await seed(db);
const server = createApp(db, client).listen(3000, '127.0.0.1', () => console.log('Demo temporal: http://127.0.0.1:3000/api. Importar .local/postman-entorno.json. Ctrl+C para terminar; los datos son temporales.'));
async function close() { server.close(); await client.close(); await repl.stop(); process.exit(0); }
process.on('SIGINT', close);
process.on('SIGTERM', close);
