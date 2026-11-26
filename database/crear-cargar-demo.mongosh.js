// Ejecutar desde la raíz del proyecto contra taller_bicicletas:
// mongosh "mongodb://localhost:27017/taller_bicicletas" --file database/crear-cargar-demo.mongosh.js
const demo = EJSON.parse(cat("database/documentos-ejemplo.extended.json"));
const target = db.getSiblingDB("taller_bicicletas");
// Crear las colecciones que falten e instalar los validadores del modelo.
// La misma configuración se aplica automáticamente al arrancar Spring Boot.
const schemas = EJSON.parse(cat("database/esquemas.mongodb.json"));
for (const [name, schema] of Object.entries(schemas)) {
  if (target.getCollectionNames().includes(name)) {
    const result = target.runCommand({
      collMod: name,
      validator: { $jsonSchema: schema },
      validationLevel: "moderate",
      validationAction: "error"
    });
    if (!result.ok) throw new Error(`No se pudo instalar el validador para ${name}.`);
  } else {
    target.createCollection(name, {
      validator: { $jsonSchema: schema },
      validationLevel: "moderate",
      validationAction: "error"
    });
  }
}
const names = Object.keys(demo).filter(name => name !== "usuarios");
for (const name of names) {
  if (target.getCollection(name).countDocuments() > 0) {
    throw new Error(`La colección ${name} ya tiene datos; el script se detiene para no duplicar ni mezclar registros.`);
  }
}
const users = {};
for (const role of ["cliente", "tecnico", "coordinador"]) {
  const user = target.usuarios.findOne({ rol: role });
  if (!user) throw new Error(`Falta el usuario demo con rol ${role}. Inicia Spring Boot primero.`);
  users[role] = user._id;
}
const oldUserIds = Object.fromEntries(demo.usuarios.map(u => [u._id.toHexString(), u.rol]));
const ids = new Map();
function collect(value) {
  if (value instanceof ObjectId) {
    const hex = value.toHexString();
    if (oldUserIds[hex]) ids.set(hex, users[oldUserIds[hex]]);
    else if (!ids.has(hex)) ids.set(hex, new ObjectId());
  } else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object" && !(value instanceof Date)) Object.values(value).forEach(collect);
}
for (const name of names) demo[name].forEach(collect);
function remap(value) {
  if (value instanceof ObjectId) return ids.get(value.toHexString());
  if (Array.isArray(value)) return value.map(remap);
  if (value instanceof Date) return value;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remap(item)]));
  return value;
}
for (const name of ["bicicletas", "servicios", "repuestos", "citas", "ordenesServicio", "trabajosOrden", "solicitudesGarantia"]) {
  const documents = demo[name].map(remap);
  if (documents.length) target.getCollection(name).insertMany(documents);
  print(`${name}: ${documents.length} documento(s)`);
}
print("Carga terminada. Los tres usuarios existentes se conservaron; sus tokens no fueron modificados.");
