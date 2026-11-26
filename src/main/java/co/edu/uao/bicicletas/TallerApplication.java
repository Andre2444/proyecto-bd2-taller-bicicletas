package co.edu.uao.bicicletas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.transaction.TransactionManager;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
public class TallerApplication {
  public static void main(String[] args) { SpringApplication.run(TallerApplication.class, args); }

  @Bean TransactionManager transactionManager(MongoDatabaseFactory factory) {
    return new MongoTransactionManager(factory);
  }
}
