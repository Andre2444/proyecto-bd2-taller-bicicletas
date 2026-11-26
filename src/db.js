import { MongoClient } from 'mongodb';

import schemas from '../database/esquemas.mongodb.json' with { type: 'json' };

export async function initDb(db) {
  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));
  for (const [name, schema] of Object.entries(schemas)) {
    const options = {
      validator: { $jsonSchema: schema },
      validationLevel: 'moderate',
      validationAction: 'error',
    };
    if (existing.has(name)) await db.command({ collMod: name, ...options });
    else await db.createCollection(name, options);
  }
  for (const field of ['documento', 'correo', 'tokenHash'])
    await db.collection('usuarios').createIndex({ [field]: 1 }, { unique: true });
  await db.collection('bicicletas').createIndex({ propietarioId: 1 });
  await db
    .collection('citas')
    .createIndex(
      { bicicletaId: 1, fechaHora: 1 },
      {
        name: 'cita_activa_unica',
        unique: true,
        partialFilterExpression: { estado: { $in: ['solicitada', 'confirmada'] } },
      },
    );
  await db
    .collection('ordenesServicio')
    .createIndex(
      { 'bicicleta.bicicletaId': 1 },
      {
        name: 'orden_activa_unica',
        unique: true,
        partialFilterExpression: {
          estado: {
            $in: [
              'recibida',
              'en diagnostico',
              'pendiente de autorizacion',
              'en ejecucion',
              'lista para entrega',
            ],
          },
        },
      },
    );
  await db.collection('ordenesServicio').createIndex({ clienteId: 1, fechaRecepcion: -1 });
  await db.collection('ordenesServicio').createIndex({ estado: 1 });
  await db.collection('trabajosOrden').createIndex({ ordenId: 1 });
  await db.collection('solicitudesGarantia').createIndex({ trabajoId: 1 });
}
export async function connect() {
  const client = new MongoClient(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/?replicaSet=rs0',
  );
  await client.connect();
  return { client, db: client.db(process.env.MONGODB_DB || 'taller_bicicletas') };
}
