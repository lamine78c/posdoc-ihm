package fr.acoss.posdoc.database.configuration;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;



@Configuration
@EnableTransactionManagement
@EnableAspectJAutoProxy
@EnableJpaRepositories(basePackages = "fr.acoss.posdoc.database.dao")
@EntityScan("fr.acoss.posdoc.database.entities")
public class DatabaseConfiguration {

}