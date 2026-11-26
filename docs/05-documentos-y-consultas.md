# Creación de documentos y consultas

## Creación reproducible

La carga inicial crea tres documentos en `usuarios`, uno por rol. La colección Postman crea bicicleta, servicio, repuesto, cita, orden, diagnóstico, trabajos, ejecución, revisión, entrega, valoración y solicitud de garantía en orden de dependencias. Los identificadores se obtienen de respuestas reales; no se usan ObjectId ficticios como referencias inexistentes.

La API instala los validadores de database/esquemas.mongodb.json y los índices de src/db.js al iniciar.

## Documento de entrada: bicicleta

En Postman, `clienteId` se toma del entorno generado por seed:

```json
{
  "propietarioId": "{{clienteId}}",
  "marca": "Trek",
  "modelo": "Marlin",
  "tipo": "montana",
  "color": "Azul",
  "caracteristicas": {
    "material": "Aluminio",
    "suspension": {"informacion": "Delantera", "recorrido": 100}
  }
}
```

MongoDB almacena `propietarioId` como ObjectId, aunque el JSON HTTP lo representa como texto. Para una bicicleta eléctrica pueden incluirse `bateria: {capacidadWh: 500, voltajeV: 36}` y `motor: {tipo: "Central", potenciaW: 250}` dentro de características.

## Documento de entrada: trabajo

```json
{
  "servicioId": "{{servicioId}}",
  "descripcionIntervencion": "Cambiar pastillas y ajustar freno",
  "componente": "Freno delantero",
  "manoObraEstimada": 30000,
  "repuestosPrevistos": [
    {"repuestoId": "{{repuestoId}}", "cantidad": 2, "precioUnitarioEstimado": 20000}
  ],
  "observaciones": "Presupuesto sujeto a autorización"
}
```

La API añade ordenId, copia del servicio, nombre y especificaciones del repuesto y `autorizacion: {decision: "pendiente"}`. El total es 30.000 + 2 × 20.000 = 70.000 COP. La autorización del cliente añade fecha y comentarios. La ejecución añade técnico, fechas y repuestos efectivamente usados. Estas etapas conservan la separación entre propuesta, decisión y trabajo realizado.

`database/documentos-ejemplo.extended.json` muestra los documentos completos resultantes en las ocho colecciones, con fechas y ObjectId representados en Extended JSON. Son datos sintéticos creados durante las pruebas. Los hashes de credenciales están omitidos explícitamente; para generar usuarios funcionales debe usarse `npm run seed`.

## Consultas incluidas

`database/consultas.mongosh.js` contiene consultas ejecutables de solo lectura: bicicletas por propietario, agenda, órdenes activas, historial con `$lookup`, suma de presupuesto, órdenes por estado, servicios propuestos, tiempos de atención y valoraciones.

Las consultas de API aplican además filtros por usuario. Ejecutar una consulta administrativa en mongosh no sustituye esos controles.

## Interpretación de estadísticas

- Servicios más solicitados: cuenta trabajos propuestos por servicio y cuántos fueron autorizados. Los trabajos sin servicio de catálogo se conservan en el historial, pero no se agrupan como un servicio inventado.
- Órdenes por estado: número de órdenes actualmente en cada estado.
- Tiempo de atención: horas entre recepción y entrega, solo para órdenes entregadas. No mide duración de mano de obra ni incluye órdenes canceladas.
- Valoraciones: cantidad y promedio de calificaciones registradas. No se asigna cero a órdenes sin valoración.
