import express from 'express';
import { ZodError } from 'zod';
import * as V from './validation.js';
import { check, createUser, hash, own, role, same } from './auth.js';

export function createApp(db, client) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  const col = name => db.collection(name);
  const get = async (name, id, session) => {
    const doc = await col(name).findOne({ _id: typeof id === 'string' ? V.objectId(id) : id }, { session });
    check(doc, `${name}: documento no encontrado`, 404);
    return doc;
  };
  const insert = async (name, doc, session) => { await col(name).insertOne(doc, { session }); return doc; };
  const update = async (name, doc, values, session) => {
    await col(name).updateOne({ _id: doc._id }, { $set: values }, { session });
    return { ...doc, ...values };
  };
  const tx = fn => client.withSession(session => session.withTransaction(() => fn(session)));
  async function userRole(id, expected, session) { const u = await get('usuarios', id, session); check(u.rol === expected, `Se requiere usuario con rol ${expected}`, 400); return u; }
  async function bikeOwner(bikeId, clientId, session) { await userRole(clientId, 'cliente', session); const b = await get('bicicletas', bikeId, session); check(same(b.propietarioId, clientId), 'La bicicleta no pertenece al cliente', 400); return b; }
  function access(user, order) { own(user, order.clienteId); if (user.rol === 'tecnico') check(order.tecnicosAsignados.some(id => same(id, user._id)), 'Técnico no asignado a esta orden', 403); }
  function open(order) { check(!['entregada', 'cancelada', 'lista para entrega'].includes(order.estado), 'La orden no admite cambios de trabajos'); }
  // Toda mutación de trabajos escribe también la orden. Así las transacciones
  // compiten por el mismo documento y no cierran una orden con datos obsoletos.
  async function lock(order, session) { await col('ordenesServicio').updateOne({ _id: order._id }, { $inc: { version: 1 }, $unset: { revisionEntrega: '' } }, { session }); }
  async function state(order, estado, user, observacion, session) {
    const entry = { estado, fecha: new Date(), usuarioId: user._id, observacion };
    await col('ordenesServicio').updateOne({ _id: order._id }, { $set: { estado }, $push: { historialEstados: entry }, $inc: { version: 1 } }, { session });
    return get('ordenesServicio', order._id, session);
  }
  const endpoint = (method, path, fn, status = 200) => app[method]('/api' + path, async (req, res) => res.status(status).json(await fn(req)));
  app.get('/api/salud', async (_req, res) => { await db.command({ ping: 1 }); res.json({ estado: 'ok' }); });
  app.use('/api', async (req, _res, next) => {
    const token = req.headers.authorization?.match(/^Bearer ([a-f\d]{64})$/i)?.[1];
    check(token, 'Se requiere Authorization: Bearer <token>', 401);
    req.user = await col('usuarios').findOne({ tokenHash: hash(token) });
    check(req.user, 'Token inválido', 401);
    next();
  });
  endpoint('get', '/usuarios/me', async r => { const { tokenHash, ...user } = r.user; return user; });
  endpoint('post', '/usuarios', async r => { role(r.user, 'coordinador'); return createUser(db, V.parse(V.usuario, r.body)); }, 201);
  endpoint('get', '/usuarios', async r => { role(r.user, 'coordinador'); return col('usuarios').find({}, { projection: { tokenHash: 0 } }).limit(100).toArray(); });
  endpoint('post', '/bicicletas', async r => {
    role(r.user, 'cliente', 'coordinador'); const data = V.parse(V.bicicleta, r.body); own(r.user, data.propietarioId);
    await userRole(data.propietarioId, 'cliente'); return insert('bicicletas', data);
  }, 201);
  endpoint('get', '/bicicletas', async r => { role(r.user, 'cliente', 'coordinador'); return col('bicicletas').find(r.user.rol === 'cliente' ? { propietarioId: r.user._id } : {}).limit(100).toArray(); });
  endpoint('patch', '/bicicletas/:id', async r => {
    role(r.user, 'cliente', 'coordinador'); const bike = await get('bicicletas', r.params.id); own(r.user, bike.propietarioId);
    const data = V.parse(V.bicicleta.omit({ propietarioId: true }).partial(), r.body); return update('bicicletas', bike, data);
  });
  for (const [name, schema] of [['servicios', V.servicio], ['repuestos', V.repuesto]]) {
    endpoint('get', `/${name}`, async () => col(name).find().limit(100).toArray());
    endpoint('post', `/${name}`, async r => { role(r.user, 'coordinador'); return insert(name, V.parse(schema, r.body)); }, 201);
    endpoint('patch', `/${name}/:id`, async r => { role(r.user, 'coordinador'); return update(name, await get(name, r.params.id), V.parse(schema.partial(), r.body)); });
  }
  endpoint('post', '/citas', async r => {
    role(r.user, 'cliente', 'coordinador'); const data = V.parse(V.cita, r.body); own(r.user, data.clienteId);
    await bikeOwner(data.bicicletaId, data.clienteId); check(data.fechaHora > new Date(), 'La cita debe estar en el futuro', 400);
    for (const id of data.serviciosInteres) await get('servicios', id);
    return insert('citas', { ...data, estado: 'solicitada' });
  }, 201);
  endpoint('get', '/citas', async r => { role(r.user, 'cliente', 'coordinador'); return col('citas').find(r.user.rol === 'cliente' ? { clienteId: r.user._id } : {}).sort({ fechaHora: 1 }).limit(100).toArray(); });
  endpoint('patch', '/citas/:id', async r => tx(async session => {
    role(r.user, 'cliente', 'coordinador'); const c = await get('citas', r.params.id, session); own(r.user, c.clienteId);
    check(['solicitada', 'confirmada'].includes(c.estado), 'La cita ya está cerrada');
    const data = V.parse(V.cambioCita, r.body);
    if (r.user.rol === 'cliente') check(data.estado === 'cancelada' && !data.fechaHora, 'El cliente solo puede cancelar; el coordinador reprograma', 403);
    if (data.fechaHora) check(data.fechaHora > new Date(), 'El nuevo horario debe estar en el futuro', 400);
    return update('citas', c, data, session);
  }));
  endpoint('post', '/ordenes', async r => tx(async session => {
    role(r.user, 'coordinador'); const data = V.parse(V.orden, r.body);
    const bike = await bikeOwner(data.bicicletaId, data.clienteId, session);
    for (const id of data.tecnicosAsignados) await userRole(id, 'tecnico', session);
    check(data.fechaEstimadaEntrega > new Date(), 'La entrega estimada debe ser posterior a la recepción', 400);
    if (data.citaId) {
      const c = await get('citas', data.citaId, session);
      check(same(c.bicicletaId, bike._id) && same(c.clienteId, data.clienteId), 'Cita de otra bicicleta o cliente', 400);
      check(['solicitada', 'confirmada'].includes(c.estado), 'Cita no activa');
      await update('citas', c, { estado: 'atendida' }, session);
    }
    const { bicicletaId, ...rest } = data; const { _id, propietarioId, ...snapshot } = bike;
    return insert('ordenesServicio', { ...rest, bicicleta: { bicicletaId: _id, ...snapshot }, coordinadorId: r.user._id, fechaRecepcion: new Date(), estado: 'recibida', version: 0, historialEstados: [{ estado: 'recibida', fecha: new Date(), usuarioId: r.user._id, observacion: 'Recepción de bicicleta' }] }, session);
  }), 201);
  endpoint('get', '/ordenes', async r => {
    const filter = r.user.rol === 'cliente' ? { clienteId: r.user._id } : r.user.rol === 'tecnico' ? { tecnicosAsignados: r.user._id } : {};
    if (r.query.estado) { check(V.estados.includes(r.query.estado), 'Estado inválido', 400); filter.estado = r.query.estado; }
    return col('ordenesServicio').find(filter).sort({ fechaRecepcion: -1 }).limit(100).toArray();
  });
  endpoint('get', '/ordenes/:id', async r => { const order = await get('ordenesServicio', r.params.id); access(r.user, order); return { ...order, trabajos: await col('trabajosOrden').find({ ordenId: order._id }).toArray() }; });
  endpoint('patch', '/ordenes/:id/tecnicos', async r => tx(async session => {
    role(r.user, 'coordinador'); const order = await get('ordenesServicio', r.params.id, session); open(order);
    const data = V.parse(V.asignacion, r.body); for (const id of data.tecnicosAsignados) await userRole(id, 'tecnico', session);
    const underway = await col('trabajosOrden').find({ ordenId: order._id, 'ejecucion.estado': 'en ejecucion' }, { session }).toArray();
    check(underway.every(t => data.tecnicosAsignados.some(id => same(id, t.tecnicoId))), 'No retire al responsable de un trabajo en ejecución');
    return update('ordenesServicio', order, data, session);
  }));
  endpoint('post', '/ordenes/:id/diagnostico', async r => tx(async session => {
    role(r.user, 'tecnico'); const order = await get('ordenesServicio', r.params.id, session); access(r.user, order); open(order);
    check(['recibida', 'en diagnostico'].includes(order.estado), 'El diagnóstico inicial ya se cerró');
    const data = V.parse(V.diagnostico, r.body);
    const diagnostico = { hallazgos: [...(order.diagnostico?.hallazgos || []), ...data.hallazgos.map(h => ({ ...h, tecnicoId: r.user._id }))], evidencias: [...(order.diagnostico?.evidencias || []), ...data.evidencias] };
    await update('ordenesServicio', order, { diagnostico }, session);
    return state(order, 'en diagnostico', r.user, 'Registro de hallazgos', session);
  }), 201);
  endpoint('post', '/ordenes/:id/trabajos', async r => tx(async session => {
    role(r.user, 'coordinador', 'tecnico'); const order = await get('ordenesServicio', r.params.id, session); access(r.user, order); open(order);
    check(order.diagnostico?.hallazgos.length, 'Se requiere diagnóstico antes de proponer trabajos');
    const data = V.parse(V.trabajo, r.body); const { servicioId, ...rest } = data;
    if (servicioId) { const s = await get('servicios', servicioId, session); rest.servicio = { servicioId, nombre: s.nombre, descripcion: s.descripcion }; }
    for (const p of rest.repuestosPrevistos) { const part = await get('repuestos', p.repuestoId, session); p.nombre = part.nombre; p.especificaciones = part.especificaciones; }
    await lock(order, session);
    const result = await insert('trabajosOrden', { ...rest, ordenId: order._id, autorizacion: { decision: 'pendiente' } }, session);
    if (order.estado !== 'en ejecucion') await state(order, 'pendiente de autorizacion', r.user, 'Trabajo propuesto para autorización', session);
    return result;
  }), 201);
  endpoint('get', '/ordenes/:id/propuesta', async r => {
    const o = await get('ordenesServicio', r.params.id); access(r.user, o);
    const trabajos = (await col('trabajosOrden').find({ ordenId: o._id }).toArray()).map(t => ({ ...t, subtotalEstimado: t.manoObraEstimada + t.repuestosPrevistos.reduce((sum, p) => sum + p.cantidad * p.precioUnitarioEstimado, 0) }));
    return { ordenId: o._id, moneda: 'COP', trabajos, totalEstimado: trabajos.reduce((s, t) => s + t.subtotalEstimado, 0), totalAutorizado: trabajos.filter(t => t.autorizacion.decision === 'autorizado').reduce((s, t) => s + t.subtotalEstimado, 0) };
  });
  endpoint('post', '/trabajos/:id/autorizacion', async r => tx(async session => {
    role(r.user, 'cliente'); const t = await get('trabajosOrden', r.params.id, session); const o = await get('ordenesServicio', t.ordenId, session); access(r.user, o); open(o);
    check(t.autorizacion.decision === 'pendiente', 'El trabajo ya tiene una decisión');
    await lock(o, session); return update('trabajosOrden', t, { autorizacion: { ...V.parse(V.decision, r.body), fecha: new Date() } }, session);
  }));
  endpoint('post', '/trabajos/:id/ejecucion', async r => tx(async session => {
    role(r.user, 'tecnico'); const t = await get('trabajosOrden', r.params.id, session); const o = await get('ordenesServicio', t.ordenId, session); access(r.user, o); open(o);
    check(t.autorizacion.decision === 'autorizado', 'Solo se ejecutan trabajos autorizados');
    check(t.ejecucion?.estado !== 'finalizado', 'El trabajo ya finalizó');
    const data = V.parse(V.ejecucion, r.body);
    if (!t.ejecucion) check(data.estado === 'en ejecucion', 'Primero debe iniciar el trabajo');
    else check(same(t.tecnicoId, r.user._id), 'Solo el técnico responsable puede actualizar este trabajo', 403);
    for (const p of data.repuestosUtilizados) {
      const expected = t.repuestosPrevistos.find(item => same(item.repuestoId, p.repuestoId));
      const total = data.repuestosUtilizados.filter(item => same(item.repuestoId, p.repuestoId)).reduce((s, item) => s + item.cantidad, 0);
      check(expected && total <= expected.cantidad && p.precioUnitarioAplicado <= expected.precioUnitarioEstimado, 'Repuesto o sobrecosto no autorizado: proponga un trabajo adicional');
      p.nombre = expected.nombre; p.especificaciones = expected.especificaciones;
    }
    await lock(o, session);
    const execution = { ...data, fechaInicio: t.ejecucion?.fechaInicio || new Date() };
    if (data.estado === 'finalizado') execution.fechaFinalizacion = new Date();
    const result = await update('trabajosOrden', t, { tecnicoId: r.user._id, ejecucion: execution }, session);
    if (o.estado !== 'en ejecucion') await state(o, 'en ejecucion', r.user, 'Inicio de trabajo autorizado', session);
    return result;
  }));
  endpoint('post', '/trabajos/:id/revision', async r => tx(async session => {
    role(r.user, 'tecnico'); const t = await get('trabajosOrden', r.params.id, session); const o = await get('ordenesServicio', t.ordenId, session); access(r.user, o); open(o);
    check(t.ejecucion?.estado === 'finalizado', 'Finalice el trabajo antes de revisarlo'); await lock(o, session);
    return update('trabajosOrden', t, { revision: V.parse(V.revision, r.body) }, session);
  }));
  endpoint('post', '/ordenes/:id/revision', async r => tx(async session => {
    role(r.user, 'tecnico', 'coordinador'); const o = await get('ordenesServicio', r.params.id, session); access(r.user, o); open(o);
    const pending = await col('trabajosOrden').countDocuments({ ordenId: o._id, 'autorizacion.decision': 'autorizado', 'ejecucion.estado': { $ne: 'finalizado' } }, { session });
    check(!pending, 'Hay trabajos autorizados sin finalizar');
    return update('ordenesServicio', o, { revisionEntrega: V.parse(V.revision, r.body) }, session);
  }));
  endpoint('post', '/ordenes/:id/estado', async r => tx(async session => {
    role(r.user, 'coordinador'); const o = await get('ordenesServicio', r.params.id, session); const data = V.parse(V.cambioEstado, r.body);
    check(!['entregada', 'cancelada'].includes(o.estado), 'Orden cerrada');
    if (data.estado === 'lista para entrega') {
      const trabajos = await col('trabajosOrden').find({ ordenId: o._id }, { session }).toArray();
      check(trabajos.length > 0 && trabajos.every(t => t.autorizacion.decision !== 'pendiente' && (t.autorizacion.decision !== 'autorizado' || t.ejecucion?.estado === 'finalizado')), 'Faltan decisiones o trabajos autorizados por finalizar');
      check(o.revisionEntrega?.aprobada, 'La revisión de entrega debe estar aprobada');
      check(o.estado !== 'lista para entrega', 'La orden ya está lista');
    } else if (data.estado === 'cancelada') {
      check(!(await col('trabajosOrden').countDocuments({ ordenId: o._id, 'ejecucion.estado': 'en ejecucion' }, { session })), 'No cancele mientras haya trabajos en ejecución');
    } else if (data.estado === 'en diagnostico') check(o.estado === 'recibida', 'Transición no permitida');
    else check(false, 'Este estado se establece por su operación específica', 400);
    return state(o, data.estado, r.user, data.observacion, session);
  }));
  endpoint('post', '/ordenes/:id/entrega', async r => tx(async session => {
    role(r.user, 'coordinador'); const o = await get('ordenesServicio', r.params.id, session); check(o.estado === 'lista para entrega', 'La orden debe estar lista para entrega');
    await update('ordenesServicio', o, { entrega: { ...V.parse(V.entrega, r.body), fecha: new Date() } }, session);
    return state(o, 'entregada', r.user, 'Recepción confirmada por el cliente', session);
  }));
  endpoint('post', '/ordenes/:id/valoracion', async r => tx(async session => {
    role(r.user, 'cliente'); const o = await get('ordenesServicio', r.params.id, session); access(r.user, o); check(o.estado === 'entregada', 'Solo se valoran órdenes entregadas'); check(!o.valoracionServicio, 'Ya existe una valoración');
    return update('ordenesServicio', o, { valoracionServicio: V.parse(V.valoracion, r.body) }, session);
  }), 201);
  endpoint('post', '/trabajos/:id/garantia', async r => tx(async session => {
    role(r.user, 'coordinador'); const t = await get('trabajosOrden', r.params.id, session); const o = await get('ordenesServicio', t.ordenId, session);
    check(o.estado === 'entregada' && t.ejecucion?.estado === 'finalizado', 'Garantía disponible después de entregar un trabajo finalizado'); check(!t.garantia, 'La garantía ya está registrada');
    const data = V.parse(V.garantia, r.body); check(data.fechaInicio >= o.entrega.fecha && data.fechaInicio <= new Date(), 'El inicio debe estar entre la entrega y la fecha actual', 400);
    return update('trabajosOrden', t, { garantia: data }, session);
  }), 201);
  endpoint('post', '/garantias/solicitudes', async r => tx(async session => {
    role(r.user, 'cliente'); const data = V.parse(V.solicitud, r.body); const t = await get('trabajosOrden', data.trabajoId, session); const o = await get('ordenesServicio', t.ordenId, session); access(r.user, o);
    const now = new Date(); check(t.garantia && now >= t.garantia.fechaInicio && now < new Date(t.garantia.fechaInicio.getTime() + t.garantia.duracion * 86400000), 'No existe garantía vigente');
    return insert('solicitudesGarantia', { ...data, fecha: now, estado: 'solicitada' }, session);
  }), 201);
  endpoint('get', '/garantias/solicitudes', async r => {
    role(r.user, 'cliente', 'coordinador');
    if (r.user.rol === 'coordinador') return col('solicitudesGarantia').find().limit(100).toArray();
    const orders = await col('ordenesServicio').find({ clienteId: r.user._id }, { projection: { _id: 1 } }).toArray();
    const works = await col('trabajosOrden').find({ ordenId: { $in: orders.map(o => o._id) } }, { projection: { _id: 1 } }).toArray();
    return col('solicitudesGarantia').find({ trabajoId: { $in: works.map(t => t._id) } }).limit(100).toArray();
  });
  endpoint('patch', '/garantias/solicitudes/:id', async r => tx(async session => {
    role(r.user, 'coordinador'); const s = await get('solicitudesGarantia', r.params.id, session); check(!['resuelta', 'rechazada'].includes(s.estado), 'Solicitud cerrada');
    const data = V.parse(V.resolver, r.body); check(data.estado !== 'rechazada' || !data.procede, 'Una solicitud rechazada no puede proceder', 400); check(data.estado !== 'resuelta' || data.procede, 'La resolución exige procedencia', 400);
    return update('solicitudesGarantia', s, data, session);
  }));
  endpoint('get', '/bicicletas/:id/historial', async r => {
    role(r.user, 'cliente', 'coordinador'); const b = await get('bicicletas', r.params.id); own(r.user, b.propietarioId);
    return col('ordenesServicio').aggregate([{ $match: { 'bicicleta.bicicletaId': b._id } }, { $sort: { fechaRecepcion: -1 } }, { $lookup: { from: 'trabajosOrden', localField: '_id', foreignField: 'ordenId', as: 'trabajos' } }, { $addFields: { intervencionesRealizadas: { $filter: { input: '$trabajos', as: 't', cond: { $eq: ['$$t.ejecucion.estado', 'finalizado'] } } } } }]).toArray();
  });
  endpoint('get', '/estadisticas', async r => {
    role(r.user, 'coordinador');
    return {
      ordenesPorEstado: await col('ordenesServicio').aggregate([{ $group: { _id: '$estado', cantidad: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray(),
      serviciosMasSolicitados: await col('trabajosOrden').aggregate([{ $match: { 'servicio.servicioId': { $exists: true } } }, { $group: { _id: '$servicio.servicioId', nombre: { $first: '$servicio.nombre' }, propuestas: { $sum: 1 }, autorizados: { $sum: { $cond: [{ $eq: ['$autorizacion.decision', 'autorizado'] }, 1, 0] } } } }, { $sort: { propuestas: -1 } }]).toArray(),
      tiemposAtencion: await col('ordenesServicio').aggregate([{ $match: { estado: 'entregada' } }, { $group: { _id: null, ordenes: { $sum: 1 }, promedioHoras: { $avg: { $divide: [{ $subtract: ['$entrega.fecha', '$fechaRecepcion'] }, 3600000] } } } }]).toArray(),
      valoraciones: await col('ordenesServicio').aggregate([{ $match: { valoracionServicio: { $exists: true } } }, { $group: { _id: null, cantidad: { $sum: 1 }, promedio: { $avg: '$valoracionServicio.calificacion' } } }]).toArray()
    };
  });
  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((error, _req, res, _next) => {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Datos inválidos', detalles: error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })) });
    if (error.code === 11000) return res.status(409).json({ error: 'Registro duplicado o conflicto de cita/orden activa' });
    if (error.code === 121) return res.status(400).json({ error: 'El documento no cumple el esquema de MongoDB' });
    const status = error.status || 500;
    if (status === 500) console.error(error);
    res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : error.message });
  });
  return app;
}
