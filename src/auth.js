import { randomBytes, createHash } from 'node:crypto';
export const hash = token => createHash('sha256').update(token).digest('hex');
export async function createUser(db, data) {
  const token = randomBytes(32).toString('hex');
  const user = { ...data, tokenHash: hash(token) };
  const result = await db.collection('usuarios').insertOne(user);
  delete user.tokenHash;
  return { ...user, _id: result.insertedId, token };
}
export function check(condition, message, status = 409) {
  if (!condition) throw Object.assign(new Error(message), { status });
}
export const same = (a, b) => String(a) === String(b);
export const role = (user, ...roles) => check(roles.includes(user.rol), 'Rol sin permiso para esta operación', 403);
export const own = (user, owner) => check(user.rol !== 'cliente' || same(user._id, owner), 'Recurso de otro cliente', 403);
