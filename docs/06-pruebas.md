# Pruebas funcionales y resultados

## Resultado de la verificación realizada

La API se ejecutó contra **MongoDB 7.0.14 real**, en un replica set temporal de un nodo, con Node.js 24.18.1. No se simuló la persistencia con arreglos en memoria ni con mocks.

| Ejecución | Resultado |
| --- | --- |
| `npm test` | 49 casos individuales correctos: 43 del flujo HTTP y 6 de integridad; el runner informa 51 tests porque cuenta también los dos grupos contenedores. 0 fallos. |
| `npm run test:postman` | Colección ejecutada con Newman: 43 solicitudes, 47 aserciones, 0 fallos. |
| Comprobación de sintaxis | app.js, db.js y api.test.js aceptados por `node --check`. |

La colección se verificó con el motor Newman, no mediante clics en la aplicación gráfica de Postman. El archivo importable es el mismo que ejecutó Newman.

## Evidencia incluida

- `evidencias/resultados-http.json`: códigos esperados y recibidos en los 43 casos HTTP, con instante de generación en UTC.
- `evidencias/resultados-postman.json`: estadísticas de ejecución y lista de errores de Newman (vacía en la ejecución verificada).
- `../database/documentos-ejemplo.extended.json`: ejemplos de las ocho colecciones, extraídos del flujo funcional antes de modificar la garantía para la prueba negativa. Los hashes de credenciales se sustituyen por texto explícito; este archivo es documentación, no una carga de usuarios con acceso funcional.
- `../test/api.test.js`: aserciones ejecutables de integridad y concurrencia.

No se incluyen capturas inventadas ni se afirma que estos resultados prueban una instalación de Docker/Atlas. La opción Docker queda proporcionada para persistencia local, pero Docker Desktop no estaba iniciado durante la verificación.

## Flujo positivo y pruebas negativas

Los 43 casos se mantienen en `test/scenarios.js`. `npm run artifacts` genera a partir de ellos la colección Postman y exporta los esquemas; así se evita documentar una secuencia distinta de la probada.

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

```powershell
npm ci
npm test
npm run test:postman
```

Ambos comandos crean y cierran su propia base temporal. La primera ejecución necesita descargar el binario de MongoDB; las siguientes reutilizan `.local/mongodb-binaries`. Los puertos de prueba se asignan automáticamente. Las credenciales usadas por Newman permanecen en memoria y no se exportan a los reportes.

Para revisión manual en Postman, seguir el README y ejecutar `npm run demo`. Las credenciales de esa demo sí se escriben en `.local/`, que debe permanecer fuera de Git y del ZIP de entrega.
