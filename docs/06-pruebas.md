# Pruebas funcionales y resultados

## Resultado de la verificación realizada

La versión de entrega Spring Boot se ejecutó contra **MongoDB 7.0.14 real**, en un replica set temporal de un nodo, con Java 21 y Newman. No se simuló la persistencia con arreglos en memoria ni con mocks.

| Ejecución | Resultado |
| --- | --- |
| `npm run test:spring` | Colección Postman contra Spring Boot y MongoDB: 43 solicitudes, 47 aserciones, 0 fallos. |
| Maven Wrapper | Compilación Java 21 correcta y JAR Spring Boot ejecutable generado. |
| `npm test` | Express histórica: 51 pruebas correctas, incluyendo permisos, validadores, historial y concurrencia. |
| `npm run test:postman` | Express histórica: 43 solicitudes, 47 aserciones, 0 fallos. |

La colección se verificó con el motor Newman contra Spring Boot, no mediante clics en la aplicación gráfica de Postman. El archivo importable es el mismo que ejecutó Newman. `scripts/test-spring-postman.js` crea su propio replica set temporal, inicia el JAR, ejecuta la colección y guarda las estadísticas sin credenciales en `evidencias/resultados-spring-postman.json`.

## Evidencia incluida

- `evidencias/resultados-http.json` y `evidencias/resultados-postman.json`: evidencia de las pruebas HTTP históricas de Express.
- `evidencias/resultados-spring-postman.json`: resultado de la colección contra Spring Boot.
- `../database/documentos-ejemplo.extended.json`: ejemplos de las ocho colecciones, extraídos del flujo funcional antes de modificar la garantía para la prueba negativa. Los hashes de credenciales se sustituyen por texto explícito; este archivo es documentación, no una carga de usuarios con acceso funcional.
- `../test/api.test.js`: aserciones ejecutables de integridad y concurrencia.

No se incluyen capturas inventadas ni se afirma que estos resultados prueban una instalación de Docker/Atlas. La opción Docker queda proporcionada para persistencia local, pero Docker Desktop no estaba iniciado durante la verificación.

## Flujo positivo y pruebas negativas

Los 43 casos HTTP se describen en la colección Postman y se ejecutan tanto contra Spring Boot como contra la versión Express de referencia.

La secuencia verifica autenticación, permisos de alta, datos inválidos, bicicleta, catálogos, cita, duplicado de cita, reprogramación, recepción, duplicado de orden, diagnóstico, propuesta, cálculo de precios, autorización, ejecución, sobrecostos, trabajo adicional rechazado, conservación de precios, revisión, entrega, valoración, garantía, historial, estadísticas y nueva recepción sin cita.

Un código 400/401/403/409 esperado es un resultado correcto de una prueba negativa. No debe cambiarse el test para exigir 200 en todas las solicitudes.

## Seis verificaciones adicionales

1. Inserción directa de documento incompleto en cada una de las ocho colecciones: MongoDB devuelve error 121.
2. Historial con dos trabajos, pero solo una intervención realizada; conserva nombre y precio de repuestos aunque cambie el catálogo.
3. Otro cliente y un técnico no asignado no acceden a la orden: 403.
4. Dos peticiones simultáneas de nueva orden para la misma bicicleta producen exactamente un 201 y un 409.
5. Una solicitud fuera del periodo de garantía se rechaza: 409. La fecha se modifica directamente solo dentro de la base aislada de prueba, no mediante una ruta pública.
6. ObjectId mal formado y JSON roto se rechazan: 400.

## Reproducción

Para comprobar la versión Spring Boot con los validadores e índices activos:

```powershell
npm ci
.\mvnw.cmd compile
.\mvnw.cmd jar:jar spring-boot:repackage
npm run test:spring
```

El runner crea y cierra una base MongoDB temporal. La primera ejecución descarga el binario si no está en `.local/mongodb-binaries`. Los tokens de prueba permanecen en memoria y no se exportan a los reportes. `npm test` y `npm run test:postman` ejecutan pruebas de la versión Express histórica.

Para revisión manual en Postman, inicia el servidor Spring Boot, copia los tokens e IDs de demostración que imprime en la terminal y completa el entorno local. No compartas ese registro de consola ni subas los tokens.

