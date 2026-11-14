import { connect, initDb } from '../src/db.js';
const { client, db } = await connect();
try { await initDb(db); console.log('Ocho colecciones, validadores e índices preparados.'); }
finally { await client.close(); }
