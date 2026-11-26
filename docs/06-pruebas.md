# Pruebas de Spring Boot

La aplicación que se entrega es Java 21 con Spring Boot. Las pruebas funcionales ejecutan el JAR real contra MongoDB 7.0.14 en un replica set temporal.

## Reproducción

```powershell
.\mvnw.cmd compile
.\mvnw.cmd jar:jar spring-boot:repackage
npm ci
npm run test:spring
```

El runner de `scripts/test-spring-postman.js` comprueba que **Java** instaló los ocho validadores y los índices únicos parciales; después ejecuta las 43 solicitudes de la colección Postman con 47 aserciones. Node.js sirve únicamente como herramienta de prueba. No instala las colecciones ni ejecuta un backend Express.

El recorrido incluye autenticación, permisos, entradas inválidas, cita duplicada, orden activa duplicada, diagnóstico, propuesta, autorización, ejecución, sobrecostos, intervención adicional rechazada, precios históricos, revisión, entrega, valoración, garantía, historial y estadísticas.

Las respuestas 400, 401, 403 y 409 esperadas validan casos negativos. La evidencia actual es `evidencias/resultados-spring-postman.json`. No contiene credenciales.

Los informes en `evidencias/historico/` corresponden a Express y no se usan como prueba de la versión Java. Tampoco se afirma que estos casos agoten todos los escenarios de concurrencia o validación posibles. No se verificó Docker Desktop ni Atlas mediante estas pruebas: se usó el replica set temporal.
