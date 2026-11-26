package co.edu.uao.bicicletas;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.bson.types.ObjectId;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class MongoJsonConfig {
  @Bean
  Jackson2ObjectMapperBuilderCustomizer mongoObjectIdAsHexString() {
    return builder -> {
      SimpleModule module = new SimpleModule("mongo-object-id-json");
      module.addSerializer(ObjectId.class, new JsonSerializer<>() {
        @Override
        public void serialize(ObjectId value, JsonGenerator generator, SerializerProvider serializers) throws IOException {
          generator.writeString(value.toHexString());
        }
      });
      builder.modulesToInstall(module);
    };
  }
}
