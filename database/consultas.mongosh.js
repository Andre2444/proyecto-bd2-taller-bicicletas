// Consultas de solo lectura. Seleccionar antes la base: use taller_bicicletas
// Se usan documentos existentes de la demostración, sin IDs inventados.
const cliente = db.usuarios.findOne({rol: 'cliente'});
if (!cliente) throw new Error('Ejecute primero la carga y el flujo Postman.');
const bicicleta = db.bicicletas.findOne({propietarioId: cliente._id});
const orden = bicicleta && db.ordenesServicio.findOne({'bicicleta.bicicletaId': bicicleta._id});

print('Bicicletas del cliente');
printjson(db.bicicletas.find({propietarioId: cliente._id}).toArray());
print('Agenda activa');
printjson(db.citas.find({estado: {$in: ['solicitada', 'confirmada']}}).sort({fechaHora: 1}).toArray());
print('Órdenes activas');
printjson(db.ordenesServicio.find({estado: {$nin: ['entregada', 'cancelada']}}).toArray());
if (bicicleta) {
  print('Historial con trabajos');
  printjson(db.ordenesServicio.aggregate([
    {$match: {'bicicleta.bicicletaId': bicicleta._id}},
    {$sort: {fechaRecepcion: -1}},
    {$lookup: {from: 'trabajosOrden', localField: '_id', foreignField: 'ordenId', as: 'trabajos'}}
  ]).toArray());
}
if (orden) {
  print('Presupuesto por trabajo y total');
  printjson(db.trabajosOrden.aggregate([
    {$match: {ordenId: orden._id}},
    {$project: {descripcionIntervencion: 1, subtotal: {$add: ['$manoObraEstimada', {$sum: {$map: {input: '$repuestosPrevistos', as: 'r', in: {$multiply: ['$$r.cantidad', '$$r.precioUnitarioEstimado']}}}}]}}},
    {$group: {_id: null, totalEstimado: {$sum: '$subtotal'}, trabajos: {$push: '$$ROOT'}}}
  ]).toArray());
}
print('Órdenes por estado');
printjson(db.ordenesServicio.aggregate([{$group: {_id: '$estado', cantidad: {$sum: 1}}}]).toArray());
print('Servicios más solicitados en propuestas');
printjson(db.trabajosOrden.aggregate([
  {$match: {'servicio.servicioId': {$exists: true}}},
  {$group: {_id: '$servicio.servicioId', nombre: {$first: '$servicio.nombre'}, cantidad: {$sum: 1}}},
  {$sort: {cantidad: -1}}
]).toArray());
print('Tiempo promedio de atención en horas');
printjson(db.ordenesServicio.aggregate([
  {$match: {estado: 'entregada'}},
  {$group: {_id: null, promedioHoras: {$avg: {$divide: [{$subtract: ['$entrega.fecha', '$fechaRecepcion']}, 3600000]}}}}
]).toArray());
print('Valoraciones');
printjson(db.ordenesServicio.aggregate([
  {$match: {valoracionServicio: {$exists: true}}},
  {$group: {_id: null, cantidad: {$sum: 1}, promedio: {$avg: '$valoracionServicio.calificacion'}}}
]).toArray());
