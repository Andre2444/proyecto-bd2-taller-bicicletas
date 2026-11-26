# Carga de datos de demostración con Compass

Los JSON de esta carpeta contienen la carga sintética de las siete colecciones de negocio. Sus referencias de usuario se ajustaron a los tres usuarios visibles en la captura de Compass; `usuarios` no se importa ni se reemplaza. Los JSON están en Extended JSON para conservar ObjectId y fechas.

## Importar

Conéctate en Compass a `localhost:27017` y a la base `taller_bicicletas`. Para cada colección abre **Add Data → Import JSON or CSV file**, elige el JSON con el mismo nombre, confirma JSON e importa. Orden recomendado: `bicicletas`, `servicios`, `repuestos`, `citas`, `ordenesServicio`, `trabajosOrden`, `solicitudesGarantia`.

Antes de importar, abre `usuarios` y confirma que los ObjectId de coordinador, técnico y cliente terminan respectivamente en `99a4`, `99a5` y `99a6`, como en la captura compartida. Si coinciden, sigue. Si no coinciden, detente y no importes estos archivos porque las referencias de usuario no apuntarían a tus usuarios. Las colecciones de negocio deben estar vacías antes de importar. No importes `usuarios`. Si alguna ya tiene documentos, detente para no duplicar.
