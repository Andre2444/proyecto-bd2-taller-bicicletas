# Sustentación y organización de la entrega

## Guion de demostración

1. Mostrar la imagen original y explicar las ocho colecciones: referencias para entidades independientes; documentos embebidos para recepción, hallazgos, estados y ejecución.
2. Explicar las adiciones mínimas necesarias para cubrir el PDF: revisión global, descripciones de evidencias e instantáneas históricas.
3. Iniciar la API y mostrar las colecciones con validadores e índices. Explicar por qué se usa un replica set y no un servidor standalone.
4. Ejecutar Postman en orden. Mostrar una cita duplicada rechazada y una orden activa duplicada rechazada.
5. Mostrar diagnóstico, propuesta de 70.000 COP y ejecución bloqueada antes de autorización.
6. Autorizar, ejecutar y finalizar. Proponer y rechazar una intervención adicional; explicar por qué queda en el historial.
7. Mostrar que cambiar el precio/nombre del catálogo no altera los valores históricos.
8. Bloquear entrega sin revisión; aprobar revisión, entregar, valorar y rechazar segunda valoración.
9. Registrar y resolver garantía sin modificar la intervención original.
10. Mostrar historial, estadísticas y resultados de `npm test`.

## Preguntas que el equipo debe poder responder

- ¿Por qué los trabajos son una colección independiente y las autorizaciones están embebidas?
- ¿Qué diferencia hay entre validar en Express y en MongoDB?
- ¿Qué significa `validationLevel: moderate` y qué ocurre con documentos antiguos inválidos?
- ¿Cómo evita el índice parcial dos órdenes activas concurrentes?
- ¿Qué operaciones requieren transacciones y qué evita escribir también la orden al modificar un trabajo?
- ¿Cómo se distingue una propuesta de un trabajo autorizado y de una intervención realmente ejecutada?
- ¿Cómo se conserva un precio histórico cuando cambia el catálogo?
- ¿Qué funcionalidades se excluyeron porque el PDF no las exige?

## GitHub y Wiki

Crear o utilizar el repositorio del equipo, revisar los archivos y publicar el código con su historial real. Copiar los documentos Markdown a la Wiki y enlazarlos desde su página inicial. No publicar `.env`, `.local`, `node_modules` ni credenciales. El ZIP de entrega excluye esas rutas.

Este trabajo local no crea un repositorio remoto ni publica una Wiki. El equipo debe usar su cuenta y registrar las contribuciones reales. No se incluyen nombres, firmas, commits o evidencias de colaboración inventados.

## Pendientes externos a la implementación

- Confirmar con el docente JavaScript y Express, porque el PDF no identifica la tecnología.
- Completar nombres y contribuciones reales del equipo en el medio de entrega del curso.
- Publicar en el GitHub y Wiki del equipo si el docente así lo requiere.
- Asistir a la sustentación presencial y comprender el código. La ejecución de pruebas no sustituye esa actividad.
