package co.edu.uao.bicicletas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
public class TallerApplication {
  public static void main(String[] args) { SpringApplication.run(TallerApplication.class, args); }

}
