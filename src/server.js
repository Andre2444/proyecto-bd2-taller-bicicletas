import { connect, initDb } from './db.js';
import { createApp } from './app.js';
const { client, db } = await connect();
await initDb(db);
const server = createApp(db, client).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('API disponible en http://127.0.0.1:' + (process.env.PORT || 3000)));
async function close() { server.close(); await client.close(); }
process.on('SIGINT', close);
process.on('SIGTERM', close);
