# Taller de bicicletas · Entrega 2

Una API en JavaScript con Express coordina las citas y reparaciones de un taller. MongoDB conserva quién pidió el servicio, qué autorizó y qué hizo el técnico. Se mantienen las ocho colecciones del diagrama del repositorio.

## Arrancar la demostración

Abre una terminal en la carpeta que contiene este README. Necesitas Node.js 22.9 o posterior.

~~~powershell
npm.cmd ci
npm.cmd run demo
~~~

Deja esa terminal abierta. Visita http://127.0.0.1:3000/api/salud. Debe responder con el estado ok. El programa inicia una base temporal y crea un cliente, un técnico y un coordinador. En Windows aprovecha MongoDB 9.0 si está instalado en la ubicación habitual. En otros equipos necesita conexión la primera vez para descargar el motor.

En Postman importa la colección **postman/BD2.postman_collection.json** y el entorno **.local/postman-entorno.json**, que aparece al arrancar la demo. Selecciona ese entorno y ejecuta la colección completa en orden. Usa una demo nueva al repetir el recorrido. Los datos temporales se descartan al detenerla.

## Recorrido para la sustentación

1. El cliente registra su bicicleta y pide una cita. Muestra la petición duplicada. MongoDB devuelve un conflicto porque esa bicicleta ya tiene una cita activa en ese horario.
2. El coordinador recibe la bicicleta y asigna al técnico. Al abrir la orden se copia la ficha de la bicicleta para conservar cómo llegó al taller.
3. El técnico anota el diagnóstico y propone cambiar las pastillas del freno. En el ejemplo, 30.000 COP de mano de obra más dos repuestos de 20.000 COP dan **70.000 COP**. Abre la ruta de propuesta en src/app.js y sigue la suma con esos tres valores.
4. Intenta iniciar el trabajo antes de autorizarlo. La API responde 409. El cliente lo autoriza y entonces el técnico puede iniciarlo y registrar su finalización.
5. El coordinador entrega la bicicleta después de una revisión aprobada. Muestra el historial, la valoración del cliente y una solicitud de garantía vinculada al trabajo original.

## Cómo explicar la base

| Colección | Qué guarda |
| --- | --- |
| usuarios | Identidad, contacto, rol y hash del token. |
| bicicletas | Propietario y características según el tipo de bicicleta. |
| servicios | Catálogo de intervenciones, duración y precio de referencia. |
| repuestos | Catálogo de piezas y especificaciones. |
| citas | Bicicleta, cliente, horario, motivo y cambios de horario. |
| ordenesServicio | Recepción, copia de la bicicleta, diagnóstico, historial de estados, revisión, entrega y valoración. |
| trabajosOrden | Cada propuesta de la orden con sus precios, autorización, ejecución, repuestos y garantía. |
| solicitudesGarantia | Reclamo sobre un trabajo, decisión y solución del coordinador. |

La orden puede tener varios trabajos. Cada trabajo guarda el identificador de su orden. El historial usa esa relación para reunirlos en una consulta. La decisión del cliente está dentro del trabajo porque se autoriza cada intervención por separado. El precio que se acordó queda guardado aunque el catálogo cambie después.

El [esquema BSON](database/esquemas.mongodb.json) define campos, tipos y obligatorios. Al iniciar, [db.js](src/db.js) instala ese esquema con validación moderada y acción de error. MongoDB rechaza las inserciones inválidas y valida los cambios de documentos que ya cumplían el esquema. Los índices únicos parciales impiden duplicar citas activas por bicicleta y horario, y órdenes activas por bicicleta. Express comprueba quién hace la petición y si la etapa permite la operación. Una transacción, por ejemplo, marca la cita atendida y crea su orden como una sola operación.

## Código y ejemplos

- [Rutas de Express](src/app.js) y [lista de operaciones por rol](docs/04-api.md).
- [Validación de entradas](src/validation.js) y [funciones de permisos](src/auth.js).
- [Creación de documentos paso a paso](docs/05-documentos-y-consultas.md), [consultas en mongosh](database/consultas.mongosh.js) y [diagrama de colecciones](docs/referencias/hackolade-proyecto.jpeg).

## Repetir las pruebas

~~~powershell
npm.cmd test
npm.cmd run test:postman
~~~

Cada comando arranca una base independiente. El primero prueba el flujo por HTTP y comprueba permisos, datos inválidos, garantía vencida y órdenes simultáneas. El segundo ejecuta la colección de Postman con Newman. Los resultados de la última ejecución están en [evidencias](docs/evidencias).

## Conservar datos después de apagar la API

Con Docker Desktop iniciado en modo Linux, ejecuta estos comandos desde esta carpeta después de instalar las dependencias. La carga inicial requiere una base sin usuarios y se hace una vez.

~~~powershell
Copy-Item .env.example .env
docker compose up -d --wait
npm.cmd run seed
npm.cmd start
~~~

Para los siguientes arranques basta levantar MongoDB y ejecutar npm.cmd start. También puedes configurar MONGODB_URI y MONGODB_DB en .env para usar tu propio replica set o Atlas. La sustentación usa tres roles, los que enumera el enunciado.
