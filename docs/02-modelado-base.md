# Modelo documental de partida

## Fuente

Se transcribe la estructura visible en `referencias/hackolade-proyecto.jpeg`. El ZIP original contiene únicamente esta imagen JPEG; no contiene un modelo editable ni un JSON Schema exportado de Hackolade. En consecuencia, cualquier esquema ejecutable será una transcripción documentada, no una exportación del archivo original.

## Las ocho colecciones

| Colección | Datos principales | Referencias y documentos embebidos |
| --- | --- | --- |
| usuarios | _id, nombreCompleto, documento, correo, telefono, rol, direccion | No tiene referencias de salida. |
| bicicletas | _id, propietarioId, marca, modelo, tipo, color, numeroSerie | propietarioId → usuarios; características embebidas con tamanoMarco, material, tamanoRueda, tipoFrenos, transmision, suspension, bateria y motor. |
| servicios | _id, nombre, categoria, descripcion, duracionEstimada, precioReferencia | tareasHabituales como arreglo de documentos con nombre y descripcion; recomendacionesGenerales. |
| repuestos | _id, nombre, especificaciones, precio | Catálogo de referencia, sin existencias ni movimientos de inventario. |
| citas | _id, clienteId, bicicletaId, fechaHora, motivo, estado, problemasObservados, serviciosInteres, observacionCambio | Referencias a usuarios, bicicletas y servicios. |
| ordenesServicio | _id, clienteId, bicicleta, citaId, fechaRecepcion, fechaEstimadaEntrega, coordinadorId, tecnicosAsignados, estado | bicicleta embebida con bicicletaId, marca y modelo; recepción, diagnóstico, entrega, valoración e historial de estados embebidos. |
| trabajosOrden | _id, ordenId, tecnicoId, servicio, descripcionIntervencion, componente, manoObraEstimada, repuestosPrevistos, autorizacion, ejecucion, revision, garantia | Referencias a orden, técnico, servicio y repuestos; autorización, ejecución, revisión y garantía embebidas. |
| solicitudesGarantia | _id, trabajoId, descripcion, fecha, evidencias, estado, procede, solucionAplicada | trabajoId → trabajosOrden; evidencias embebidas. |

## Composición observada

- `bicicletas.caracteristicas.suspension`: informacion y recorrido.
- `bicicletas.caracteristicas.bateria`: capacidadWh y voltajeV.
- `bicicletas.caracteristicas.motor`: tipo y potenciaW.
- `ordenesServicio.recepcion`: problemaReportado, condicionesObservadas, accesorios y fotografias (nombreArchivo, ubicacion).
- `ordenesServicio.diagnostico`: hallazgos (tecnicoId, componente, condicion, descripcion, prioridad, observaciones, accionesRecomendadas) y evidencias (nombreArchivo, ubicacion).
- `ordenesServicio.entrega`: fecha y confirmacionRecepcionCliente.
- `ordenesServicio.valoracionServicio`: calificacion, comentarios y sugerencias.
- `ordenesServicio.historialEstados`: estado, fecha, usuarioId y observacion.
- `trabajosOrden.servicio`: servicioId y nombre.
- `trabajosOrden.repuestosPrevistos`: repuestoId, nombre, especificaciones, cantidad y precioUnitarioEstimado.
- `trabajosOrden.autorizacion`: decision, fecha y comentarios.
- `trabajosOrden.ejecucion`: fechaInicio, fechaFinalizacion, estado, descripcionRealizada y repuestosUtilizados (repuestoId, cantidad, precioUnitarioAplicado).
- `trabajosOrden.revision`: resultado, aprobada y recomendaciones.
- `trabajosOrden.garantia`: duracion, fechaInicio, condiciones y exclusiones.
- `solicitudesGarantia.evidencias`: nombreArchivo, descripcion y ubicacion.

## Justificación de referencias y embebidos

Los usuarios, bicicletas y catálogos tienen identidad propia y se consultan de forma independiente; por ello son colecciones referenciadas. Las órdenes agrupan recepción, diagnóstico y seguimiento porque forman parte del mismo servicio. Los trabajos están separados para conservar autorizaciones, ejecución y garantía por intervención. Las solicitudes de garantía referencian el trabajo original y no lo sobrescriben.

Los nombres y precios embebidos son instantáneas históricas. Consultar el catálogo actual sirve para preparar nuevas propuestas, pero no debe reemplazar valores ya registrados en una orden.

## Ajustes mínimos necesarios para satisfacer el PDF

La imagen no expresa todas las reglas del enunciado. Se deben conservar las ocho colecciones y documentar explícitamente los siguientes complementos al implementar:

| Diferencia | Ajuste mínimo y motivo |
| --- | --- |
| La instantánea de bicicleta solo muestra marca y modelo. | Conservar también las características y demás datos relevantes al recibirla: el PDF exige conservar características históricas. |
| Fotografías/evidencias de la orden no muestran descripción. | Añadir descripcion a los adjuntos para cumplir nombre, descripción y ubicación. |
| Los trabajos no muestran un campo general de observaciones. | Añadir observaciones al trabajo propuesto. |
| La revisión aparece por trabajo, no por orden, y no muestra puntos verificados. | Conservar la revisión por trabajo y añadir revisionEntrega en la orden con puntos verificados, resultado, aprobación y recomendaciones. La condición de lista para entrega se evalúa sobre la orden completa. |
| Repuestos usados solo conservan identificador, cantidad y precio. | Añadir nombre y especificaciones de los repuestos efectivamente utilizados para preservar el historial ante cambios del catálogo. |
| servicio solo conserva identificador y nombre. | Conservar la descripción aplicable a la intervención al crear el trabajo. |
| No hay controles gráficos para duplicados ni referencias por rol. | Implementar índices y validaciones de negocio; una referencia ObjectId por sí sola no impide propietarios incorrectos o roles inválidos. |

Estos ajustes complementan el modelo para cubrir el enunciado; no introducen inventario, facturación ni pagos.

## Reglas de integridad previstas

- Las referencias deben apuntar a documentos existentes. MongoDB no crea claves foráneas automáticamente.
- `clienteId` y `propietarioId` corresponden al rol cliente; los responsables y asignados deben tener el rol pertinente.
- Las citas y órdenes deben corresponder al propietario de la bicicleta.
- Una orden activa es cualquiera cuyo estado no sea entregada ni cancelada.
- Una cita activa es solicitada o confirmada.
- La ausencia de cita se representa sin una referencia obligatoria; no se crea una cita ficticia.
- La valoración se almacena una sola vez dentro de la orden y solo la registra su cliente.
- Los cambios de estado y sus entradas de historial deben guardarse de forma atómica.
- Las operaciones que afectan una orden y sus trabajos requieren una estrategia de concurrencia que impida autorizar, agregar o iniciar trabajos mientras se cierra la orden.
- No se deben eliminar registros referenciados si ello destruye el historial.

## Estado de este documento

Documento de análisis basado en las fuentes. Los esquemas e índices de MongoDB están en `src/db.js` y `database/esquemas.mongodb.json`; la API de entrega está implementada con Java y Spring Boot en `src/main/java`. Las rutas y consultas se explican en `04-api.md` y `05-documentos-y-consultas.md`.
