# Proyecto BD2 - Entrega 2

API REST para un taller de mantenimiento y reparación de bicicletas de Cali. Implementación de entrega en **Java 21, Spring Boot y MongoDB**, basada en las ocho colecciones del modelado de Hackolade de la primera entrega.

La versión Express/Node se conserva como historial de desarrollo y sus pruebas de referencia. Para la entrega y ejecución usa Spring Boot (`src/main/java`).

## Inicio rápido

Para ejecutar requiere Java 21, Docker Desktop y conexión a Internet para la primera descarga de dependencias. Node.js se requiere para preparar la base y correr las pruebas repetibles. Inicia Docker Desktop y desde una terminal en la carpeta del proyecto ejecuta:

```powershell
docker compose up -d
.\mvnw.cmd spring-boot:run
```

La API inicia en `http://127.0.0.1:3000/api` y MongoDB conserva sus datos en un volumen Docker. La primera vez que no existan usuarios, la aplicación crea un coordinador, técnico y cliente de demostración e imprime sus IDs y tokens en la terminal. Copia los valores a las variables del entorno local de Postman. Se muestran una sola vez; no compartas ni publiques esos tokens.

Importa `postman/BD2.postman_collection.json` y `postman/local.postman_environment.json`. Ejecuta los requests en orden con Collection Runner. Algunas respuestas 400, 403 y 409 son resultados esperados de las pruebas negativas.

## MongoDB y datos

El contenedor usa un replica set porque las operaciones del flujo actualizan más de un documento en una transacción. También puedes usar MongoDB Atlas o un replica set compatible. Un `mongod` standalone no soporta transacciones.

La configuración Docker enlaza MongoDB solo a `127.0.0.1:27017`. En la base destinada al proyecto instala índices y validadores con:

```powershell
npm ci
npm.cmd run db:init
```

Este comando no elimina documentos. Configura `MONGODB_URI` y `MONGODB_DB` para usar otros valores.

## Pruebas

Con Node.js instalado, el runner inicia su propio MongoDB temporal; no requiere Docker para probar. Compila previamente el JAR y ejecuta la colección contra Spring Boot:

```powershell
npm ci
.\mvnw.cmd compile
.\mvnw.cmd jar:jar spring-boot:repackage
npm run test:spring
```

El script inicia la aplicación y un replica set temporal, corre 43 solicitudes con 47 aserciones y guarda el resultado sin tokens en `docs/evidencias/resultados-spring-postman.json`. Las pruebas `npm test` y `npm run test:postman` corresponden a la implementación Express previa.

## Contenido

- `src/main/`: API Spring Boot, conexión MongoDB, autenticación y errores.
- `database/`: esquemas MongoDB, creación de colecciones y consultas de ejemplo.
- `postman/`: colección de 43 pruebas y entorno sin credenciales.
- `scripts/test-spring-postman.js`: ejecución repetible de Postman contra Spring Boot.
- `src/` y `test/`: implementación Express previa y pruebas de referencia.
- `docs/`: requisitos, modelado, implementación, contrato API, consultas, pruebas y sustentación.
- `docs/referencias/`: PDF del curso y modelado original.

## Alcance

Incluye clientes, técnicos, coordinadores, bicicletas, catálogos, citas, recepción, diagnóstico, propuestas, autorizaciones, ejecución, revisión, entrega, garantías, valoraciones, historial y estadísticas. No incluye frontend, inventario, facturación ni pagos.

Los adjuntos se registran por nombre, descripción y ubicación. El enunciado no requiere almacenar archivos.

## Documentación y repositorio

Lee `docs/01-alcance-y-requisitos.md`, `02-modelado-base.md`, `03-implementacion.md`, `04-api.md`, `05-documentos-y-consultas.md`, `06-pruebas.md` y `07-sustentacion-y-entrega.md` en ese orden. Repositorio privado: [Andre2444/proyecto-bd2-taller-bicicletas](https://github.com/Andre2444/proyecto-bd2-taller-bicicletas). La documentación está en `docs/`; no se ha publicado como Wiki ni se han atribuido contribuciones ficticias a integrantes.

