package fr.acoss.posdoc.ws;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(enableDefaultTransactions = false)
@ComponentScan("fr.acoss.posdoc")
public class PosdocIhmBeApplication {

  public static void main(String[] args) {
    SpringApplication.run(PosdocIhmBeApplication.class, args);
  }

}
