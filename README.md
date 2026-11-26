# Taller de bicicletas — Entrega 2

Backend **Java 21 + Spring Boot 3.5.7 + MongoDB**, basado en la rama `main` de GitHub y en el modelado Hackolade. El servidor Express fue retirado; la versión anterior queda en el historial Git.

## Abrir y ejecutar

Abre `Taller-BD2.code-workspace` en VS Code. El código está en `src/main/java/co/edu/uao/bicicletas`. También puedes abrir `pom.xml` en IntelliJ IDEA.

Requiere **JDK 21** y el servicio de MongoDB iniciado en Windows. Si tienes Compass, conéctalo a `mongodb://localhost:27017`; Compass permite ver la base, mientras el servicio MongoDB es el que la ejecuta. Si el servicio está detenido, abre Inicio, busca `Servicios`, ubica `MongoDB Server` y selecciona **Iniciar**. No hace falta Docker.

En VS Code abre **Terminal → Nueva terminal**, verifica que la terminal esté en la carpeta del proyecto y ejecuta:

```powershell
.\mvnw.cmd spring-boot:run
```

La primera ejecución descarga Maven y sus dependencias. Deja la terminal abierta: cuando aparezca `Started TallerApplication`, el servidor está funcionando. Comprueba `http://127.0.0.1:3000/api/salud`; debe responder `{"estado":"ok"}`. Para detenerlo, pulsa `Ctrl+C` en la terminal.

Es una API REST, no una página web. Para demostrar sus operaciones, importa `postman/BD2.postman_collection.json` en Postman. Las agregaciones para mostrar durante la sustentación están en `database/consultas.mongosh.js`; se ejecutan en Compass, en **Aggregations**, después de tener datos en la base.

Para preparar datos de demostración si las colecciones de negocio están vacías, inicia primero Spring Boot (así se instalan esquemas e índices) y luego, desde la raíz del proyecto, ejecuta `mongosh "mongodb://localhost:27017/taller_bicicletas" --file database/crear-cargar-demo.mongosh.js`. El script conserva los usuarios existentes y se detiene si detecta datos previos en otras colecciones. Después ejecuta `mongosh "mongodb://localhost:27017/taller_bicicletas" --file database/consultas.mongosh.js`, o copia cada pipeline en la pestaña **Aggregations** de Compass.

Si no tienes `mongosh` en la terminal, puedes cargar los documentos con Compass: sigue `database/compass-import/LEEME.md`, verifica allí los ObjectId de `usuarios` e importa sus siete JSON sin importar esa colección. Para ejecutar agregaciones sin `load()`, abre el shell integrado `>_` y pega los comandos de `database/compass-import/consultas-compass.txt` uno a uno. Los detalles están en la [documentación oficial del shell de Compass](https://www.mongodb.com/docs/compass/embedded-shell/).

Spring Boot instala automáticamente los validadores e índices de MongoDB. Cuando no hay usuarios, crea un cliente, técnico y coordinador de demostración e imprime sus IDs y tokens una sola vez. Importa `postman/BD2.postman_collection.json` y `postman/local.postman_environment.json`; completa las variables con esos valores y ejecuta la colección en orden sobre una base de demostración nueva. Los códigos 400, 401, 403 y 409 de los casos negativos son esperados.

MongoDB conserva los datos en la base `taller_bicicletas`. Al primer inicio, Spring Boot crea colecciones, validadores, índices y tres usuarios de demostración, e imprime sus IDs y tokens en la terminal. Guarda esos valores para configurar el entorno local de Postman; no compartas los tokens. Para usar Atlas u otro servidor, define `MONGODB_URI` y `MONGODB_DB` en la terminal antes de iniciar Java. Spring Boot no carga archivos `.env` automáticamente.

## Pruebas opcionales

Node.js solo se usa para ejecutar Newman y levantar una base temporal de prueba. No se necesita para ejecutar el backend o instalar el esquema.

```powershell
.\mvnw.cmd compile
.\mvnw.cmd jar:jar spring-boot:repackage
npm ci
npm run test:spring
```

El runner inicia el JAR Java y un replica set temporal, comprueba que Java instaló los ocho validadores y los índices parciales, y ejecuta las 43 solicitudes y 47 aserciones Postman. La evidencia está en `docs/evidencias/resultados-spring-postman.json`. Las evidencias anteriores de Express están identificadas en `docs/evidencias/historico/`.

## Documentos y código

- `pom.xml`, `mvnw.cmd`, `.mvn/`: proyecto Java y Maven Wrapper.
- `src/main/java/`: backend Spring Boot. `DatabaseInitializer` instala MongoDB, `DemoUsers` crea usuarios y `ApiController` contiene las operaciones del taller.
- `database/esquemas.mongodb.json`: fuente del esquema, incluida en el JAR al compilar.
- `database/consultas.mongosh.js`: agregaciones y consultas para practicar la sustentación.
- `database/crear-cargar-demo.mongosh.js`: crea las colecciones que falten, instala los validadores y carga los documentos de demostración sin sobrescribir usuarios.
- `docs/evidencias/pruebas-postman.md` y los JSON asociados: solicitudes, códigos y respuestas observados en la prueba automatizada.
- `docs/01-alcance-y-requisitos.md` a `docs/07-sustentacion-y-entrega.md`: documentación de la actividad.
- `docs/referencias/enunciado-proyecto.pdf`: PDF original del curso; el modelado de referencia está en la misma carpeta.

El alcance incluye citas, órdenes, diagnósticos, autorizaciones, ejecución, entrega, garantías, valoraciones e historial. No incluye frontend, inventario, facturación ni pagos.

Repositorio: [Andre2444/proyecto-bd2-taller-bicicletas, rama main](https://github.com/Andre2444/proyecto-bd2-taller-bicicletas/tree/main). GitHub lo reportó público al comprobar la sincronización. La documentación está en `docs/`; no se ha publicado como Wiki.
