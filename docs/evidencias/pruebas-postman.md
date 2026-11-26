# Evidencia de pruebas funcionales en Postman

Colección: `postman/BD2.postman_collection.json`. Ejecución comprobada con Newman contra Spring Boot y MongoDB temporal. Resultado: **43 solicitudes, 47 aserciones, cero fallos**. En las pruebas negativas, el código indicado es el rechazo esperado.

`respuestas-spring-postman.json` conserva para cada solicitud el método, ruta, código HTTP y cuerpo JSON que devolvió el backend. Los campos de tokens y secretos se excluyen. Ejemplos observados: `GET /api/salud` respondió `200 {"estado":"ok"}`; una consulta sin token respondió `401 {"error":"Se requiere token Bearer válido"}`; la propuesta respondió `200` con `totalEstimado: 70000` COP.

| N.º | Solicitud | Método y ruta | Estado esperado/observado |
|---:|---|---|---:|
| 1 | 01 Salud de la API | `GET :baseUrl/salud` | 200 |
| 2 | 02 Rechazar acceso sin token | `GET :baseUrl/ordenes` | 401 |
| 3 | 03 Cliente no crea usuarios | `POST :baseUrl/usuarios` | 403 |
| 4 | 04 Rechazar bicicleta inválida | `POST :baseUrl/bicicletas` | 400 |
| 5 | 05 Registrar bicicleta de montaña | `POST :baseUrl/bicicletas` | 201 |
| 6 | 06 Crear servicio | `POST :baseUrl/servicios` | 201 |
| 7 | 07 Crear repuesto | `POST :baseUrl/repuestos` | 201 |
| 8 | 08 Solicitar cita | `POST :baseUrl/citas` | 201 |
| 9 | 09 Rechazar cita activa duplicada | `POST :baseUrl/citas` | 409 |
| 10 | 10 Confirmar y reprogramar cita | `PATCH :baseUrl/citas/:citaId` | 200 |
| 11 | 11 Recibir bicicleta con cita | `POST :baseUrl/ordenes` | 201 |
| 12 | 12 Rechazar segunda orden activa | `POST :baseUrl/ordenes` | 409 |
| 13 | 13 Registrar diagnóstico | `POST :baseUrl/ordenes/:ordenId/diagnostico` | 201 |
| 14 | 14 Crear trabajo propuesto | `POST :baseUrl/ordenes/:ordenId/trabajos` | 201 |
| 15 | 15 Consultar total de propuesta | `GET :baseUrl/ordenes/:ordenId/propuesta` | 200 |
| 16 | 16 Bloquear ejecución pendiente | `POST :baseUrl/trabajos/:trabajoId/ejecucion` | 409 |
| 17 | 17 Autorizar trabajo | `POST :baseUrl/trabajos/:trabajoId/autorizacion` | 200 |
| 18 | 18 Bloquear cambio de decisión | `POST :baseUrl/trabajos/:trabajoId/autorizacion` | 409 |
| 19 | 19 Iniciar ejecución autorizada | `POST :baseUrl/trabajos/:trabajoId/ejecucion` | 200 |
| 20 | 20 Bloquear entrega prematura | `POST :baseUrl/ordenes/:ordenId/estado` | 409 |
| 21 | 21 Bloquear valoración anticipada | `POST :baseUrl/ordenes/:ordenId/valoracion` | 409 |
| 22 | 22 Bloquear sobrecosto no autorizado | `POST :baseUrl/trabajos/:trabajoId/ejecucion` | 409 |
| 23 | 23 Finalizar trabajo | `POST :baseUrl/trabajos/:trabajoId/ejecucion` | 200 |
| 24 | 24 Proponer intervención adicional | `POST :baseUrl/ordenes/:ordenId/trabajos` | 201 |
| 25 | 25 Rechazar trabajo adicional | `POST :baseUrl/trabajos/:trabajoAdicionalId/autorizacion` | 200 |
| 26 | 26 Bloquear ejecución rechazada | `POST :baseUrl/trabajos/:trabajoAdicionalId/ejecucion` | 409 |
| 27 | 27 Cambiar catálogo sin cambiar historial | `PATCH :baseUrl/repuestos/:repuestoId` | 200 |
| 28 | 28 Comprobar presupuesto histórico | `GET :baseUrl/ordenes/:ordenId/propuesta` | 200 |
| 29 | 29 Revisión individual del trabajo | `POST :baseUrl/trabajos/:trabajoId/revision` | 200 |
| 30 | 30 Bloquear lista sin revisión de entrega | `POST :baseUrl/ordenes/:ordenId/estado` | 409 |
| 31 | 31 Aprobar revisión de entrega | `POST :baseUrl/ordenes/:ordenId/revision` | 200 |
| 32 | 32 Marcar lista para entrega | `POST :baseUrl/ordenes/:ordenId/estado` | 200 |
| 33 | 33 Entregar bicicleta | `POST :baseUrl/ordenes/:ordenId/entrega` | 200 |
| 34 | 34 Registrar valoración | `POST :baseUrl/ordenes/:ordenId/valoracion` | 201 |
| 35 | 35 Rechazar valoración duplicada | `POST :baseUrl/ordenes/:ordenId/valoracion` | 409 |
| 36 | 36 Registrar garantía | `POST :baseUrl/trabajos/:trabajoId/garantia` | 201 |
| 37 | 37 Reportar inconveniente en garantía | `POST :baseUrl/garantias/solicitudes` | 201 |
| 38 | 38 Resolver garantía | `PATCH :baseUrl/garantias/solicitudes/:solicitudId` | 200 |
| 39 | 39 Consultar historial | `GET :baseUrl/bicicletas/:bicicletaId/historial` | 200 |
| 40 | 40 Consultar estadísticas | `GET :baseUrl/estadisticas` | 200 |
| 41 | 41 Cliente no consulta estadísticas globales | `GET :baseUrl/estadisticas` | 403 |
| 42 | 42 Nueva recepción sin cita tras entrega | `POST :baseUrl/ordenes` | 201 |
| 43 | 43 Cancelar segunda orden | `POST :baseUrl/ordenes/:ordenSinCitaId/estado` | 200 |

Los estados corresponden a la colección ejecutada; el resumen está en `resultados-spring-postman.json` y los cuerpos de respuesta están en `respuestas-spring-postman.json`. No se guardan tokens ni secretos.
