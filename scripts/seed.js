import { mkdir, writeFile } from 'node:fs/promises';
import { connect, initDb } from '../src/db.js';
import { createUser } from '../src/auth.js';
export async function seed(db) {
  if (await db.collection('usuarios').countDocuments()) throw new Error('La carga inicial requiere una base sin usuarios. No se modifica la base existente.');
  const users = {};
  for (const [i, rol] of ['coordinador', 'tecnico', 'cliente'].entries()) {
    users[rol] = await createUser(db, { nombreCompleto: `Usuario demostración ${rol}`, documento: `DEMO-${i + 1}`, correo: `${rol}@example.test`, telefono: '3000000000', rol, ...(rol === 'cliente' ? { direccion: 'Cali, dirección de demostración' } : {}) });
  }
  await mkdir('.local', { recursive: true });
  const environment = { name: 'BD2 - local (credenciales privadas)', values: [{ key: 'baseUrl', value: 'http://127.0.0.1:3000/api', enabled: true }, ...Object.entries(users).flatMap(([rol, u]) => [{ key: rol + 'Token', value: u.token, type: 'secret', enabled: true }, { key: rol + 'Id', value: String(u._id), enabled: true }])], _postman_variable_scope: 'environment' };
  await writeFile('.local/postman-entorno.json', JSON.stringify(environment, null, 2));
  return users;
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/scripts/seed.js')) {
  const { client, db } = await connect();
  try { await initDb(db); await seed(db); console.log('Usuarios creados. Entorno Postman en .local/postman-entorno.json.'); }
  finally { await client.close(); }
}
