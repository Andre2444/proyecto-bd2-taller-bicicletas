# Esquema e implementación

## Arquitectura

La implementación elegida para el curso es Java 21 con Spring Boot 3.5 y Spring Data MongoDB. `TallerApplication` inicia la aplicación, `ApiController` recibe las rutas REST y usa `MongoTemplate` para leer y escribir documentos; `ApiException` y `ApiErrors` traducen excepciones a respuestas HTTP. La aplicación conserva las ocho colecciones. `DatabaseInitializer` instala los validadores `$jsonSchema` y los índices al iniciar Java, antes de `DemoUsers`.

La implementación conserva `usuarios`, `bicicletas`, `servicios`, `repuestos`, `citas`, `ordenesServicio`, `trabajosOrden` y `solicitudesGarantia`. No crea tablas relacionales ni colecciones de inventario o facturas.

## Tipos y convenciones

- `_id` y referencias: BSON ObjectId. En HTTP se transmiten como cadenas hexadecimales de 24 caracteres.
- Fechas: BSON Date; en HTTP, ISO 8601 con zona explícita, por ejemplo `2026-11-26T09:00:00-05:00`. La persistencia representa el instante en UTC; Cali usa UTC-05:00.
- `citas.fechaHora` conserva fecha y hora en un solo valor, como en el modelo. La igualdad de horario significa igualdad del instante; no se inventa una duración de cita ni una política de solapamiento por técnico.
- Importes: números enteros de pesos colombianos (COP), no negativos, hasta mil millones por precio de entrada. No se implementan centavos, cobros ni impuestos.
- `duracionEstimada`: minutos. `garantia.duracion`: días de 24 horas. La vigencia incluye el inicio y excluye el instante de expiración.
- `calificacion`: entero de 1 a 5. Tipos de bicicleta: `urbana`, `ruta`, `montana`, `electrica`. Las cadenas técnicas se mantienen sin tildes para facilitar las solicitudes.
- Roles: `cliente`, `tecnico`, `coordinador`. El cuarto rol mencionado pero no enumerado en el PDF no se inventa.
- Los catálogos se actualizan mediante PATCH; los documentos históricos no se eliminan mediante la API.

Estas convenciones resuelven detalles no definidos en el enunciado y no se atribuyen al docente.

## Esquema moderado

`database/esquemas.mongodb.json` contiene el esquema de cada colección. `DatabaseInitializer` crea colecciones o actualiza sus validadores con `validationLevel: "moderate"` y `validationAction: "error"`.

No se usa `additionalProperties: false`: los documentos admiten ampliaciones compatibles. La API solo acepta los campos de entrada definidos, salvo características técnicas adicionales de bicicletas. La estructura flexible no permite eludir la validación de los campos conocidos.

MongoDB aplica la validación moderada a inserciones y actualizaciones de documentos que ya cumplían el esquema; puede permitir actualizar documentos preexistentes inválidos. En una base nueva, todos los documentos creados por la API se validan. Si se migra una base antigua, se deben auditar los datos antes de afirmar que todos cumplen el esquema.

## Índices

| Colección | Campos | Finalidad |
| --- | --- | --- |
| usuarios | documento; correo; tokenHash | Tres índices únicos, uno por campo. Evitan identificación/correo duplicado y permiten localizar credenciales. |
| bicicletas | propietarioId | Consultar bicicletas del cliente. |
| citas | bicicletaId + fechaHora, único parcial | Se aplica solo a solicitada/confirmada; evita duplicados activos incluso con peticiones concurrentes. |
| ordenesServicio | bicicleta.bicicletaId, único parcial | Se aplica a recibida, en diagnostico, pendiente de autorizacion, en ejecucion y lista para entrega. |
| ordenesServicio | clienteId + fechaRecepcion descendente | Historial por cliente. |
| ordenesServicio | estado | Listados y estadísticas. |
| trabajosOrden | ordenId | Propuesta e intervenciones de una orden. |
| solicitudesGarantia | trabajoId | Vinculación con la intervención original. |

Los índices parciales usan el estado real; no dependen de una bandera `activa` que podría desincronizarse.

## Estados y operaciones

Una orden inicia `recibida`. Registrar diagnóstico la deja `en diagnostico`. Proponer el primer trabajo la deja `pendiente de autorizacion`. Iniciar un trabajo autorizado establece `en ejecucion`. Una intervención adicional no revierte los trabajos que ya se ejecutan, pero nace con autorización `pendiente`.

Para pasar a `lista para entrega` se requieren trabajos registrados, todas las decisiones tomadas, todos los trabajos autorizados finalizados y revisión de entrega aprobada. Exigir resolver decisiones pendientes es una decisión conservadora para no cerrar una propuesta todavía abierta. Los trabajos rechazados permanecen registrados y no aparecen entre las intervenciones realizadas. Una orden con todos los trabajos rechazados puede cerrarse tras su revisión, sin inventar trabajos ejecutados.

La entrega requiere estado listo y confirmación de recepción `true`; el servidor registra la fecha. Se puede cancelar una orden no cerrada si no tiene trabajos en ejecución. La cancelación conserva el historial. No se permite reabrir órdenes entregadas/canceladas ni editar trabajos ya finalizados.

## Transacciones y concurrencia

El `MongoTransactionManager` y `@Transactional` agrupan cada operación de la API. Crear una orden desde una cita cambia la cita a atendida y crea la orden dentro de la misma transacción. Si falla la orden, el cambio de cita se revierte.

Toda mutación de autorización, propuesta, ejecución o revisión individual escribe también la orden e invalida su revisión global previa. De este modo compite con las operaciones de cierre sobre un mismo documento y evita una decisión de entrega basada en trabajos obsoletos. La operación se confirma o revierte como una unidad en el replica set; no se lanzan operaciones paralelas dentro de una transacción.

Las escrituras de estado y entrada de historial son atómicas. La unicidad de citas/órdenes se protege además con índices, por lo que no depende únicamente de un `find` previo.

## Propuestas e historial

El total estimado se calcula como `suma(manoObraEstimada + suma(cantidad × precioUnitarioEstimado))`. `totalEstimado` muestra toda la propuesta, incluidas intervenciones rechazadas; `totalAutorizado` incluye solo trabajos autorizados.

La orden guarda una copia de los datos de la bicicleta al recibirla. Los trabajos guardan nombre y descripción del servicio, nombre/especificaciones de repuestos y precios acordados. La ejecución guarda repuestos realmente usados con cantidades y precios aplicados. Los cambios posteriores de catálogo no se propagan a esas copias.

La ejecución permite cantidades y precios iguales o inferiores a lo autorizado. Un repuesto distinto o sobrecosto exige un trabajo adicional con autorización propia. Esto evita convertir una autorización inicial en autorización abierta para cualquier intervención.

## Garantías y valoración

El coordinador registra una garantía una sola vez para un trabajo finalizado de una orden entregada. Su fecha de inicio debe estar entre la entrega y el momento actual. El cliente puede presentar una solicitud durante la vigencia. La solución queda en `solicitudesGarantia`, sin modificar la ejecución original.

La valoración se guarda dentro de la orden una sola vez. La API exige orden entregada y cliente propietario. La transacción impide dos valoraciones simultáneas.

## Identidad y errores

Cada usuario recibe un token aleatorio de 32 bytes. Solo su SHA-256 se guarda en `usuarios.tokenHash`; no se devuelve ese hash en los listados. Si no existen usuarios, `DemoUsers` crea tres cuentas de demostración e imprime sus tokens una sola vez al iniciar. Las siguientes altas las autoriza el coordinador. Esta solución académica no incluye recuperación de cuentas, login por contraseña ni renovación de tokens.

Los errores usan JSON: `400` datos/esquema inválidos, `401` credencial ausente/inválida, `403` rol o propietario incorrecto, `404` recurso inexistente, `409` duplicados o transición incompatible y `500` fallo interno sin revelar el detalle técnico al cliente.

## Referencias técnicas

- Integración oficial: [transacciones de Spring Data MongoDB](https://docs.spring.io/spring-data/mongodb/reference/mongodb/client-session-transactions.html).
- Framework: [Spring Boot](https://spring.io/projects/spring-boot) y [Spring Data MongoDB](https://docs.spring.io/spring-data/mongodb/reference/).

Los requisitos funcionales proceden del PDF local del curso; estas referencias solo apoyan decisiones técnicas.
