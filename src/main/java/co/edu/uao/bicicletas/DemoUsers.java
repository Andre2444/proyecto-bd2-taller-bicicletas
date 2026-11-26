package co.edu.uao.bicicletas;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class DemoUsers {
  @Bean @org.springframework.core.annotation.Order(1)
  CommandLineRunner bootstrapDemoUsers(MongoTemplate mongo) {
    return args -> {
      if (mongo.getCollection("usuarios").countDocuments() != 0) return;
      SecureRandom random = new SecureRandom();
      for (String role : List.of("coordinador", "tecnico", "cliente")) {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        org.bson.Document user = new org.bson.Document("_id", new ObjectId())
            .append("nombreCompleto", "Usuario demostración " + role)
            .append("documento", "DEMO-" + role)
            .append("correo", role + "@example.test")
            .append("telefono", "3000000000")
            .append("rol", role)
            .append("tokenHash", hash);
        mongo.insert(user, "usuarios");
        System.out.printf("Token inicial de demostración (%s): %s | ID: %s%n", role, token, user.getObjectId("_id"));
      }
    };
  }
}
