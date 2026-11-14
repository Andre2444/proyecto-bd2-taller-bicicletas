import { MongoClient } from 'mongodb';

const str = { bsonType: 'string', minLength: 1 };
const oid = { bsonType: 'objectId' };
const fecha = { bsonType: 'date' };
const num = { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 };
const obj = (required, properties) => ({ bsonType: 'object', ...(required.length ? { required } : {}), properties });
const arr = items => ({ bsonType: 'array', items });
const enumStr = values => ({ bsonType: 'string', enum: values });
const adjunto = obj(['nombreArchivo', 'descripcion', 'ubicacion'], { nombreArchivo: str, descripcion: str, ubicacion: str });
const ids = arr(oid);
const bool = { bsonType: 'bool' };
const parte = obj(['repuestoId', 'nombre', 'especificaciones', 'cantidad'], { repuestoId: oid, nombre: str, especificaciones: str, cantidad: { ...num, minimum: 1 }, precioUnitarioEstimado: num, precioUnitarioAplicado: num });
const revision = obj(['puntosVerificados', 'resultado', 'aprobada', 'recomendaciones'], { puntosVerificados: arr(obj(['punto', 'resultado'], { punto: str, resultado: str })), resultado: str, aprobada: bool, recomendaciones: arr(str) });
export const schemas = {
  usuarios: obj(['nombreCompleto', 'documento', 'correo', 'telefono', 'rol', 'tokenHash'], { nombreCompleto: str, documento: str, correo: str, telefono: str, rol: enumStr(['cliente', 'tecnico', 'coordinador']), direccion: str, tokenHash: str }),
  bicicletas: obj(['propietarioId', 'marca', 'modelo', 'tipo', 'color', 'caracteristicas'], { propietarioId: oid, marca: str, modelo: str, tipo: enumStr(['urbana', 'ruta', 'montana', 'electrica']), color: str, numeroSerie: str, caracteristicas: obj([], { tamanoMarco: str, material: str, tamanoRueda: str, tipoFrenos: str, transmision: str, suspension: obj(['informacion', 'recorrido'], { informacion: str, recorrido: num }), bateria: obj(['capacidadWh', 'voltajeV'], { capacidadWh: num, voltajeV: num }), motor: obj(['tipo', 'potenciaW'], { tipo: str, potenciaW: num }) }) }),
  servicios: obj(['nombre', 'categoria', 'descripcion', 'duracionEstimada', 'precioReferencia', 'tareasHabituales', 'recomendacionesGenerales'], { nombre: str, categoria: enumStr(['mantenimiento preventivo', 'frenos', 'transmision', 'ruedas', 'suspension', 'componentes electricos']), descripcion: str, duracionEstimada: num, precioReferencia: num, tareasHabituales: arr(obj(['nombre', 'descripcion'], { nombre: str, descripcion: str })), recomendacionesGenerales: arr(str) }),
  repuestos: obj(['nombre', 'especificaciones', 'precio'], { nombre: str, especificaciones: str, precio: num }),
  citas: obj(['clienteId', 'bicicletaId', 'fechaHora', 'motivo', 'estado', 'problemasObservados', 'serviciosInteres'], { clienteId: oid, bicicletaId: oid, fechaHora: fecha, motivo: str, estado: enumStr(['solicitada', 'confirmada', 'atendida', 'cancelada']), problemasObservados: str, serviciosInteres: ids, observacionCambio: str }),
  ordenesServicio: obj(['clienteId', 'bicicleta', 'fechaRecepcion', 'fechaEstimadaEntrega', 'coordinadorId', 'tecnicosAsignados', 'estado', 'recepcion', 'historialEstados', 'version'], { clienteId: oid, bicicleta: obj(['bicicletaId', 'marca', 'modelo', 'caracteristicas'], { bicicletaId: oid, marca: str, modelo: str, caracteristicas: { bsonType: 'object' } }), citaId: oid, fechaRecepcion: fecha, fechaEstimadaEntrega: fecha, coordinadorId: oid, tecnicosAsignados: ids, estado: enumStr(['recibida', 'en diagnostico', 'pendiente de autorizacion', 'en ejecucion', 'lista para entrega', 'entregada', 'cancelada']), recepcion: obj(['problemaReportado', 'condicionesObservadas', 'accesorios', 'fotografias'], { problemaReportado: str, condicionesObservadas: str, accesorios: arr(str), fotografias: arr(adjunto) }), diagnostico: obj(['hallazgos', 'evidencias'], { hallazgos: arr(obj(['tecnicoId', 'componente', 'condicion', 'descripcion', 'prioridad', 'observaciones', 'accionesRecomendadas'], { tecnicoId: oid, componente: str, condicion: str, descripcion: str, prioridad: enumStr(['baja', 'media', 'alta', 'critica']), observaciones: str, accionesRecomendadas: arr(str) })), evidencias: arr(adjunto) }), historialEstados: arr(obj(['estado', 'fecha', 'usuarioId', 'observacion'], { estado: str, fecha, usuarioId: oid, observacion: str })), revisionEntrega: revision, entrega: obj(['fecha', 'confirmacionRecepcionCliente'], { fecha, confirmacionRecepcionCliente: bool }), valoracionServicio: obj(['calificacion', 'comentarios', 'sugerencias'], { calificacion: { bsonType: ['int', 'double'], minimum: 1, maximum: 5 }, comentarios: str, sugerencias: str }), version: num }),
  trabajosOrden: obj(['ordenId', 'descripcionIntervencion', 'componente', 'manoObraEstimada', 'repuestosPrevistos', 'observaciones', 'autorizacion'], { ordenId: oid, tecnicoId: oid, servicio: obj(['servicioId', 'nombre', 'descripcion'], { servicioId: oid, nombre: str, descripcion: str }), descripcionIntervencion: str, componente: str, manoObraEstimada: num, repuestosPrevistos: arr(parte), observaciones: str, autorizacion: obj(['decision'], { decision: enumStr(['pendiente', 'autorizado', 'rechazado']), fecha, comentarios: str }), ejecucion: obj(['estado', 'fechaInicio', 'descripcionRealizada', 'repuestosUtilizados'], { estado: enumStr(['en ejecucion', 'finalizado']), fechaInicio: fecha, fechaFinalizacion: fecha, descripcionRealizada: str, repuestosUtilizados: arr(parte) }), revision, garantia: obj(['duracion', 'fechaInicio', 'condiciones', 'exclusiones'], { duracion: { ...num, minimum: 1 }, fechaInicio: fecha, condiciones: str, exclusiones: str }) }),
  solicitudesGarantia: obj(['trabajoId', 'descripcion', 'fecha', 'evidencias', 'estado'], { trabajoId: oid, descripcion: str, fecha, evidencias: arr(adjunto), estado: enumStr(['solicitada', 'en revision', 'resuelta', 'rechazada']), procede: bool, solucionAplicada: str })
};
export async function initDb(db) {
  const existing = new Set((await db.listCollections().toArray()).map(c => c.name));
  for (const [name, schema] of Object.entries(schemas)) {
    const options = { validator: { $jsonSchema: schema }, validationLevel: 'moderate', validationAction: 'error' };
    if (existing.has(name)) await db.command({ collMod: name, ...options });
    else await db.createCollection(name, options);
  }
  for (const field of ['documento', 'correo', 'tokenHash']) await db.collection('usuarios').createIndex({ [field]: 1 }, { unique: true });
  await db.collection('bicicletas').createIndex({ propietarioId: 1 });
  await db.collection('citas').createIndex({ bicicletaId: 1, fechaHora: 1 }, { name: 'cita_activa_unica', unique: true, partialFilterExpression: { estado: { $in: ['solicitada', 'confirmada'] } } });
  await db.collection('ordenesServicio').createIndex({ 'bicicleta.bicicletaId': 1 }, { name: 'orden_activa_unica', unique: true, partialFilterExpression: { estado: { $in: ['recibida', 'en diagnostico', 'pendiente de autorizacion', 'en ejecucion', 'lista para entrega'] } } });
  await db.collection('ordenesServicio').createIndex({ clienteId: 1, fechaRecepcion: -1 });
  await db.collection('ordenesServicio').createIndex({ estado: 1 });
  await db.collection('trabajosOrden').createIndex({ ordenId: 1 });
  await db.collection('solicitudesGarantia').createIndex({ trabajoId: 1 });
}
export async function connect() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/?replicaSet=rs0');
  await client.connect();
  return { client, db: client.db(process.env.MONGODB_DB || 'taller_bicicletas') };
}
