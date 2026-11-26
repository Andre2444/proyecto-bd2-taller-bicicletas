package co.edu.uao.bicicletas;

import com.mongodb.client.model.IndexOptions;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.bson.Document;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

/** Instala el esquema de Hackolade adaptado y los índices antes de crear usuarios. */
@Component
@Order(0)
public class DatabaseInitializer implements CommandLineRunner {
  private final MongoTemplate mongo;

  public DatabaseInitializer(MongoTemplate mongo) { this.mongo = mongo; }

  @Override
  public void run(String... args) throws Exception {
    Document schemas;
    try (var input = new ClassPathResource("database/esquemas.mongodb.json").getInputStream()) {
      schemas = Document.parse(new String(input.readAllBytes(), StandardCharsets.UTF_8));
    }
    for (String name : schemas.keySet()) {
      String operation = mongo.collectionExists(name) ? "collMod" : "create";
      mongo.getDb().runCommand(new Document(operation, name)
          .append("validator", new Document("$jsonSchema", schemas.get(name)))
          .append("validationLevel", "moderate").append("validationAction", "error"));
    }
    for (String field : List.of("documento", "correo", "tokenHash")) {
      mongo.getCollection("usuarios").createIndex(new Document(field, 1), new IndexOptions().unique(true));
    }
    mongo.getCollection("bicicletas").createIndex(new Document("propietarioId", 1));
    mongo.getCollection("citas").createIndex(new Document("bicicletaId", 1).append("fechaHora", 1),
        new IndexOptions().name("cita_activa_unica").unique(true).partialFilterExpression(
            new Document("estado", new Document("$in", List.of("solicitada", "confirmada")))));
    mongo.getCollection("ordenesServicio").createIndex(new Document("bicicleta.bicicletaId", 1),
        new IndexOptions().name("orden_activa_unica").unique(true).partialFilterExpression(
            new Document("estado", new Document("$in", List.of("recibida", "en diagnostico",
                "pendiente de autorizacion", "en ejecucion", "lista para entrega")))));
    mongo.getCollection("ordenesServicio").createIndex(new Document("clienteId", 1).append("fechaRecepcion", -1));
    mongo.getCollection("ordenesServicio").createIndex(new Document("estado", 1));
    mongo.getCollection("trabajosOrden").createIndex(new Document("ordenId", 1));
    mongo.getCollection("solicitudesGarantia").createIndex(new Document("trabajoId", 1));
  }
}
