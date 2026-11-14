# Proyecto BD2 - Entrega 2

API REST para un taller de mantenimiento y reparación de bicicletas de Cali. Implementación en **JavaScript, Express y MongoDB**, basada en las ocho colecciones del diagrama de Hackolade de la primera entrega.

**Decisión pendiente del curso:** el PDF exige el lenguaje y framework definidos por el docente, pero no los nombra. Se eligió JavaScript con Express a partir de la indicación del estudiante. Esta elección debe confirmarse con el docente; no se presenta como una exigencia del PDF.

## Inicio rápido: demostración temporal

Requiere Node.js 22.9 o posterior, npm y conexión a Internet para la primera descarga. En Windows, si PowerShell bloquea `npm.ps1`, usar `npm.cmd` en lugar de `npm`.

```powershell
npm ci
npm run demo
```

Se inicia un MongoDB real temporal en un replica set de un nodo y la API en `http://127.0.0.1:3000/api`. La primera ejecución descarga MongoDB 7.0.14 (en Windows la descarga puede superar 590 MB). Esta opción es para demostración: los datos no se conservan al terminar. No requiere Docker.

1. Abrir Postman e importar `postman/BD2.postman_collection.json`.
2. Importar y seleccionar `.local/postman-entorno.json`, creado al iniciar la demo.
3. Ejecutar los **43 requests en orden**, con Collection Runner y una iteración.
4. Revisar los tests: algunos requests esperan deliberadamente 400, 401, 403 o 409.
5. Para repetir desde cero, terminar la demo, iniciarla otra vez, volver a importar el entorno y borrar los valores actuales de las variables de la colección. No ejecutar la colección dos veces sobre los mismos datos.

## Ejecución con datos persistentes

Requiere Docker Desktop iniciado con contenedores Linux, o un MongoDB compatible con transacciones (replica set/Atlas). Un `mongod` standalone no permite las transacciones usadas aquí.

```powershell
npm ci
Copy-Item .env.example .env
docker compose up -d --wait
npm run db:init
npm run seed
npm start
```

`npm run seed` crea tres usuarios de demostración y se niega a ejecutarse si ya existen usuarios. Los tokens se entregan en `.local/credenciales-demo.json` y en el entorno Postman local. No se imprimen ni se incluyen en Git. El coordinador puede crear más usuarios con `POST /api/usuarios`, que devuelve su token una sola vez.

La configuración Docker es exclusivamente local: el puerto de MongoDB está enlazado a `127.0.0.1`. Para una base existente o Atlas, modificar `MONGODB_URI` y `MONGODB_DB` en `.env`. `db:init` instala validadores e índices; debe aplicarse sobre una base destinada a este proyecto. No elimina documentos.

## Pruebas automatizadas

```powershell
npm test
npm run test:postman
```

Las pruebas levantan una base MongoDB real y aislada. Incluyen los mismos 43 casos de Postman y verificaciones adicionales de validación directa, permisos, conservación histórica, duplicados concurrentes, garantía vencida y datos mal formados. La ejecución escribe `docs/evidencias/resultados-http.json`. El segundo comando ejecuta la colección con Newman y guarda `docs/evidencias/resultados-postman.json`. El resultado de la suite completa se documenta en `docs/06-pruebas.md`.

## Contenido de la entrega

| Ruta | Contenido |
| --- | --- |
| `src/` | API, validaciones, permisos y esquema de MongoDB. |
| `scripts/` | Inicialización, usuarios de ejemplo, demo y generación de artefactos. |
| `database/` | Esquemas exportados, creación de colecciones y consultas de ejemplo. |
| `postman/` | Colección con pruebas y entorno sin secretos. |
| `test/` | Pruebas HTTP, integridad y concurrencia. |
| `docs/` | Requisitos, modelado, implementación, API, pruebas y sustentación. |
| `docs/referencias/` | PDF original e imagen original del modelado. |

## Alcance

Incluye clientes, técnicos, coordinadores, bicicletas, catálogo, citas, recepción, diagnóstico, propuestas, autorizaciones, ejecución, revisión, entrega, garantías, valoraciones, historial y estadísticas. No incluye frontend, inventario, facturación ni pagos.

La autenticación con tokens Bearer sirve para demostrar y aplicar los permisos de los tres roles. Los archivos adjuntos se registran por nombre, descripción y ubicación; no se implementa almacenamiento ni carga de archivos, que el enunciado no exige.

## Documentación

Leer `docs/01-alcance-y-requisitos.md`, `02-modelado-base.md`, `03-implementacion.md`, `04-api.md`, `05-documentos-y-consultas.md`, `06-pruebas.md` y `07-sustentacion-y-entrega.md` en ese orden. Son archivos Markdown listos para incorporarse a GitHub Wiki. Repositorio privado: [Andre2444/proyecto-bd2-taller-bicicletas](https://github.com/Andre2444/proyecto-bd2-taller-bicicletas). La documentación está en `docs/`; no se ha publicado como Wiki ni se han atribuido contribuciones ficticias a integrantes.
