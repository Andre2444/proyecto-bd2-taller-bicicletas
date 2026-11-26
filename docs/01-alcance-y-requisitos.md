# Entrega 2: gestión de mantenimiento y reparación de bicicletas

## Fuente y alcance

Este proyecto se basa en el enunciado del curso de Bases de Datos 2 y en la primera entrega de Hackolade suministrada como imagen. Las fuentes se conservan en `docs/referencias/`.

La segunda entrega, prevista en el enunciado para el 26 de noviembre de 2026, comprende API REST, pruebas funcionales y documentación del modelado, esquema, creación de documentos y consultas. También requiere sustentación presencial. No requiere frontend, inventario, facturación ni procesamiento de pagos.

La base de datos debe ser MongoDB, con un esquema moderado que permita extender documentos y controle los errores de inserción. El PDF no identifica el lenguaje ni el framework; para la entrega se usa Java con Spring Boot, según la aclaración posterior del estudiante sobre lo solicitado en clase.

## Correspondencia entre requisitos y modelo entregado

| ID | Requisito del enunciado | Colecciones del modelo | Criterio de aceptación |
| --- | --- | --- | --- |
| R01 | Usuarios con identificación y datos de contacto | usuarios | Registrar nombre completo, documento, correo, teléfono y rol; dirección para clientes. |
| R02 | Bicicletas con propietario y características variables | bicicletas, usuarios | Un cliente puede registrar varias bicicletas; número de serie opcional y características de suspensión, motor o batería según corresponda. |
| R03 | Catálogo de servicios | servicios | Conservar categoría, descripción, duración estimada, precio de referencia, tareas habituales y recomendaciones. |
| R04 | Programación de citas | citas | Registrar cliente, bicicleta, fecha/hora, motivo, problemas y servicios de interés; confirmar, atender, cancelar o reprogramar con observación. |
| R05 | Evitar citas activas duplicadas | citas | Rechazar una segunda cita solicitada o confirmada para la misma bicicleta y el mismo instante. |
| R06 | Recepción y órdenes con o sin cita | ordenesServicio | Registrar cliente, bicicleta, fechas, coordinador, técnicos, problema, condiciones, accesorios y fotografías opcionales. |
| R07 | Una sola orden activa por bicicleta | ordenesServicio | Rechazar una nueva orden mientras exista otra no entregada y no cancelada. |
| R08 | Diagnóstico y evidencias | ordenesServicio | Registrar múltiples hallazgos con técnico, componente, condición, descripción, prioridad, observaciones, acciones y adjuntos. |
| R09 | Propuesta de intervención | trabajosOrden, servicios, repuestos | Registrar uno o varios trabajos con mano de obra, componente, repuestos previstos y observaciones; calcular el total estimado. |
| R10 | Autorización por trabajo | trabajosOrden | El cliente propietario autoriza o rechaza cada trabajo, conservando fecha y comentarios. |
| R11 | Ejecución de trabajos autorizados | trabajosOrden | Impedir iniciar trabajos pendientes o rechazados; conservar técnico responsable, fechas, estado, descripción y repuestos utilizados. |
| R12 | Intervenciones adicionales | trabajosOrden | Crear un nuevo trabajo pendiente de autorización, sin ampliar silenciosamente un trabajo autorizado. |
| R13 | Seguimiento de estados | ordenesServicio | Cada cambio conserva fecha, usuario y observación; los trabajos rechazados permanecen en el historial. |
| R14 | Revisión y entrega | ordenesServicio, trabajosOrden | Exigir todos los trabajos autorizados finalizados y revisión de entrega aprobada antes de marcar lista; registrar fecha y confirmación del cliente al entregar. |
| R15 | Garantías y solicitudes | trabajosOrden, solicitudesGarantia | Asociar duración, inicio, condiciones y exclusiones; registrar inconveniente durante vigencia, evidencias, estado, procedencia y solución sin alterar el trabajo original. |
| R16 | Historial y valoración | bicicletas, ordenesServicio | Consultar historial por bicicleta; aceptar una valoración por orden y cliente, únicamente si la orden está entregada. |
| R17 | Estadísticas | servicios, trabajosOrden, ordenesServicio | Consultar servicios más solicitados, órdenes por estado, tiempos de atención y valoraciones. |
| R18 | Conservación histórica | ordenesServicio, trabajosOrden | Cambiar el catálogo no debe modificar descripciones, características ni precios registrados en órdenes anteriores. |
| R19 | Validación y errores | Todas | Rechazar documentos inválidos con errores comprensibles, conservando posibilidad de añadir campos compatibles. |

## Aclaraciones del enunciado

- El PDF dice «cuatro roles», pero enumera únicamente cliente, técnico y coordinador. Se siguen los tres roles enumerados; no se inventa un cuarto.
- No se especifican zona horaria, escala de valoración, unidad de garantía, moneda ni precisión monetaria. Las convenciones elegidas deberán documentarse como decisiones de implementación, sin atribuirlas al PDF.
- Las acciones del cliente corresponden a sus bicicletas y órdenes; los técnicos registran diagnósticos, trabajos y recomendaciones; el coordinador organiza agenda, asignaciones y supervisión.
- GitHub y GitHub Wiki son herramientas solicitadas para código y documentación. Los archivos locales pueden prepararse para publicarse allí, pero no constituyen por sí mismos evidencia de publicación o colaboración.
- La sustentación y las contribuciones reales de los integrantes no pueden sustituirse por registros inventados. La entrega debe incluir una guía de demostración y documentación que el equipo pueda estudiar.

## Pruebas funcionales mínimas previstas

1. Crear cliente, técnico y coordinador; rechazar datos inválidos.
2. Registrar bicicletas de distintos tipos y verificar propiedad.
3. Crear y reprogramar citas; rechazar duplicados activos y permitir reemplazo de una cita cancelada.
4. Recibir bicicleta con cita y sin cita; rechazar segunda orden activa.
5. Asignar técnicos y registrar diagnóstico con múltiples hallazgos y evidencias.
6. Crear propuesta con varios trabajos y verificar suma de mano de obra y cantidades por precios de repuestos.
7. Autorizar un trabajo y rechazar otro; bloquear ejecución de trabajos no autorizados.
8. Registrar ejecución y repuestos aplicados; incorporar un trabajo adicional con nueva autorización.
9. Bloquear estado lista para entrega si faltan trabajos autorizados o revisión aprobada.
10. Completar revisión, entregar y verificar historial de estados y confirmación.
11. Crear garantía, reportar inconveniente dentro de vigencia y documentar solución; rechazar solicitudes fuera de vigencia.
12. Valorar orden entregada; rechazar valoración anticipada, ajena o duplicada.
13. Consultar historial y estadísticas; actualizar catálogo y comprobar conservación de valores históricos.
14. Verificar rechazo de documentos inválidos directamente en MongoDB y manejo de errores de la API.

Estos son criterios de aceptación. Los resultados ejecutados y su alcance se documentan por separado en `06-pruebas.md` y `evidencias/`.
