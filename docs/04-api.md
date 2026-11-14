# Contrato de la API REST

Base local: `http://127.0.0.1:3000/api`. Todas las entradas y respuestas son JSON. Salvo `/salud`, las rutas exigen `Authorization: Bearer <token>`. Las fechas se envían en ISO 8601 con zona. Los ejemplos completos de cuerpos y respuestas esperadas están en la colección Postman; no contiene tokens reales.

C = cliente; T = técnico; O = coordinador. Las rutas del cliente verifican propiedad y las del técnico verifican asignación cuando trabajan con una orden.

| Método y ruta | Rol | Operación / cuerpo principal |
| --- | --- | --- |
| GET /salud | Público | Estado del servicio y conexión a MongoDB. |
| GET /usuarios/me | C/T/O | Datos del usuario autenticado, sin hash. |
| POST /usuarios | O | nombreCompleto, documento, correo, telefono, rol; direccion opcional. Devuelve token una vez. |
| GET /usuarios | O | Lista de usuarios, sin tokens. |
| POST /bicicletas | C/O | propietarioId, marca, modelo, tipo, color, caracteristicas; numeroSerie opcional. |
| GET /bicicletas | C/O | Bicicletas propias o todas para coordinador. |
| PATCH /bicicletas/:id | C/O | Actualiza los datos descriptivos; no transfiere propiedad. |
| GET /bicicletas/:id/historial | C/O | Órdenes, todos sus trabajos e intervenciones realmente finalizadas. |
| GET /servicios | C/T/O | Catálogo de servicios. |
| POST /servicios | O | nombre, categoria, descripcion, duracionEstimada, precioReferencia, tareasHabituales y recomendacionesGenerales. |
| PATCH /servicios/:id | O | Cambia valores actuales del catálogo. |
| GET /repuestos | C/T/O | Catálogo sin inventario. |
| POST /repuestos | O | nombre, especificaciones, precio. |
| PATCH /repuestos/:id | O | Cambia valores actuales del repuesto. |
| POST /citas | C/O | clienteId, bicicletaId, fechaHora, motivo, problemasObservados, serviciosInteres opcional. |
| GET /citas | C/O | Agenda propia o global para coordinador. |
| PATCH /citas/:id | C/O | estado y/o fechaHora, con observacionCambio obligatoria. Cliente solo cancela. |
| POST /ordenes | O | clienteId, bicicletaId, fechaEstimadaEntrega, tecnicosAsignados, recepcion; citaId opcional. |
| GET /ordenes | C/T/O | Órdenes accesibles; acepta `?estado=entregada`. |
| GET /ordenes/:id | C/T/O | Orden con trabajos. |
| PATCH /ordenes/:id/tecnicos | O | tecnicosAsignados: arreglo no vacío. No permite retirar al responsable de un trabajo en ejecución. |
| POST /ordenes/:id/diagnostico | T | hallazgos y evidencias. Se agregan al diagnóstico, sin sobrescribir hallazgos previos. |
| POST /ordenes/:id/trabajos | T/O | descripcionIntervencion, componente, manoObraEstimada, observaciones, repuestosPrevistos; servicioId opcional. |
| GET /ordenes/:id/propuesta | C/T/O | Trabajos, subtotal, totalEstimado y totalAutorizado, en COP. |
| POST /trabajos/:id/autorizacion | C | decision: autorizado/rechazado y comentarios. Fecha del servidor. |
| POST /trabajos/:id/ejecucion | T | estado: en ejecucion/finalizado, descripcionRealizada, repuestosUtilizados. Responsable y fechas del servidor. |
| POST /trabajos/:id/revision | T | puntosVerificados, resultado, aprobada y recomendaciones. |
| POST /ordenes/:id/revision | T/O | Revisión global de entrega, con la misma estructura. |
| POST /ordenes/:id/estado | O | estado y observacion. Permite en diagnostico desde recibida, lista para entrega o cancelada, con sus reglas. |
| POST /ordenes/:id/entrega | O | confirmacionRecepcionCliente: true. |
| POST /ordenes/:id/valoracion | C | calificacion 1..5, comentarios, sugerencias. |
| POST /trabajos/:id/garantia | O | duracion en días, fechaInicio, condiciones, exclusiones. |
| POST /garantias/solicitudes | C | trabajoId, descripcion, evidencias. Fecha y estado inicial del servidor. |
| GET /garantias/solicitudes | C/O | Solicitudes propias o globales. |
| PATCH /garantias/solicitudes/:id | O | estado: en revision/resuelta/rechazada, procede y solucionAplicada. |
| GET /estadisticas | O | Órdenes por estado, servicios propuestos/autorizados, promedio de atención en horas y promedio de valoraciones. |

Las altas devuelven 201, salvo autorización y operaciones de transición que devuelven 200. Los listados generales se limitan a 100 documentos para la demostración académica; no se implementa paginación. El historial y las agregaciones consultan el conjunto correspondiente completo.

## Estructuras reutilizadas

```json
{
  "evidencias": [
    {"nombreArchivo": "freno.jpg", "descripcion": "Estado del freno", "ubicacion": "/evidencias/freno.jpg"}
  ],
  "puntosVerificados": [
    {"punto": "Frenado", "resultado": "Correcto"}
  ]
}
```

`repuestosPrevistos` lleva repuestoId, cantidad y precioUnitarioEstimado. `repuestosUtilizados` lleva repuestoId, cantidad y precioUnitarioAplicado. Los nombres/especificaciones se toman de las copias autorizadas para que el cliente no los falsifique. Para finalizar, se envía la lista completa de repuestos realmente utilizados, no un incremento.

## Ejemplo de error

```json
{"error":"Solo se ejecutan trabajos autorizados"}
```

Un error de campos incluye `detalles`, con `campo` y `mensaje`. Un error 409 requiere corregir el estado o el conflicto; repetir la misma petición no lo convierte en válido.
