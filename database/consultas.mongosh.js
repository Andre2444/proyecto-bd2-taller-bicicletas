// Cinco agregaciones de análisis para la entrega.
// Ejecutar después de cargar datos: mongosh "mongodb://localhost:27017/taller_bicicletas" --file database/consultas.mongosh.js
if (db.trabajosOrden.countDocuments() == 0 || db.ordenesServicio.countDocuments() == 0) throw new Error('Base vacía: ejecute database/crear-cargar-demo.mongosh.js.');

// 1. ¿Qué servicios reciben más propuestas y cuánto valor económico representan?
print('\n1. Servicios propuestos, autorizaciones e importe estimado');
printjson(db.trabajosOrden.aggregate([
 {$match:{'servicio.servicioId':{$exists:true}}},
 {$project:{servicioId:'$servicio.servicioId',nombre:'$servicio.nombre',decision:'$autorizacion.decision',subtotal:{$add:['$manoObraEstimada',{$sum:{$map:{input:{$ifNull:['$repuestosPrevistos',[]]},as:'r',in:{$multiply:['$$r.cantidad','$$r.precioUnitarioEstimado']}}}}]}}},
 {$group:{_id:'$servicioId',servicio:{$first:'$nombre'},propuestas:{$sum:1},autorizados:{$sum:{$cond:[{$eq:['$decision','autorizado']},1,0]}},valorPropuestoCOP:{$sum:'$subtotal'}}},
 {$sort:{propuestas:-1,servicio:1}}
]).toArray());

// 2. ¿Cómo se distribuyen las órdenes por tipo de bicicleta y estado?
print('\n2. Órdenes agrupadas por tipo y estado');
printjson(db.ordenesServicio.aggregate([{$group:{_id:{tipo:'$bicicleta.tipo',estado:'$estado'},cantidad:{$sum:1}}},{$sort:{'_id.tipo':1,'_id.estado':1}}]).toArray());

// 3. ¿Cuál es la calificación promedio por tipo de bicicleta?
print('\n3. Calificación promedio y número de órdenes valoradas por tipo');
printjson(db.ordenesServicio.aggregate([{$match:{'valoracionServicio.calificacion':{$exists:true}}},{$group:{_id:'$bicicleta.tipo',ordenesValoradas:{$sum:1},promedio:{$avg:'$valoracionServicio.calificacion'},minimo:{$min:'$valoracionServicio.calificacion'},maximo:{$max:'$valoracionServicio.calificacion'}}},{$sort:{_id:1}}]).toArray());

// 4. ¿Cuántas órdenes se entregaron cada mes y cuánto tardaron en promedio?
print('\n4. Tiempo de atención mensual de órdenes entregadas');
printjson(db.ordenesServicio.aggregate([{$match:{estado:'entregada','entrega.fecha':{$type:'date'}}},{$project:{mes:{$dateToString:{format:'%Y-%m',date:'$entrega.fecha'}},horas:{$divide:[{$subtract:['$entrega.fecha','$fechaRecepcion']},3600000]}}},{$group:{_id:'$mes',entregadas:{$sum:1},promedioHoras:{$avg:'$horas'},maximoHoras:{$max:'$horas'}}},{$sort:{_id:1}}]).toArray());

// 5. ¿Cuántas solicitudes de garantía hay por estado y a qué valor de trabajos se asocian?
print('\n5. Solicitudes de garantía y valor de sus trabajos relacionados');
printjson(db.solicitudesGarantia.aggregate([{$lookup:{from:'trabajosOrden',localField:'trabajoId',foreignField:'_id',as:'trabajo'}},{$unwind:'$trabajo'},{$project:{estado:1,subtotal:{$add:['$trabajo.manoObraEstimada',{$sum:{$map:{input:{$ifNull:['$trabajo.repuestosPrevistos',[]]},as:'r',in:{$multiply:['$$r.cantidad','$$r.precioUnitarioEstimado']}}}}]}}},{$group:{_id:'$estado',solicitudes:{$sum:1},valorTrabajosCOP:{$sum:'$subtotal'}}},{$sort:{_id:1}}]).toArray());
