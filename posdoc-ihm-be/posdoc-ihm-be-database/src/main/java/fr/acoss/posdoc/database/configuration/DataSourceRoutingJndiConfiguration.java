package fr.acoss.posdoc.database.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;
import org.springframework.jdbc.datasource.lookup.JndiDataSourceLookup;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@Configuration
@ConditionalOnProperty(prefix = "posdoc.datasource", name = "mode", havingValue = "jndi")
public class DataSourceRoutingJndiConfiguration {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceRoutingJndiConfiguration.class);

  @Bean
  @Primary
  public DataSource dataSource(
      @Value("${posdoc.datasource.write.jndi-name}") final String writeJndi,
      @Value("${posdoc.datasource.read.jndi-name}") final String readJndi) {

    LOGGER.info("Routing DataSource (JNDI) : write={}, read={}", writeJndi, readJndi);

    final var lookup = new JndiDataSourceLookup();
    lookup.setResourceRef(false);
    final DataSource write = lookup.getDataSource(writeJndi);
    final DataSource read = lookup.getDataSource(readJndi);

    return buildRouting(write, read);
  }

  static DataSource buildRouting(final DataSource write, final DataSource read) {
    final Map<Object, Object> targets = new HashMap<>();
    targets.put(AccessType.READ_WRITE, write);
    targets.put(AccessType.READ_ONLY, read);

    final var routing = new RoutingDataSource();
    routing.setTargetDataSources(targets);
    routing.setDefaultTargetDataSource(write);
    routing.afterPropertiesSet();

    // Configuration explicite des defaults pour éviter que afterPropertiesSet()
    // ouvre une connexion au boot juste pour les détecter (PG : autoCommit=true, READ_COMMITTED).
    final var lazy = new LazyConnectionDataSourceProxy();
    lazy.setTargetDataSource(routing);
    lazy.setDefaultAutoCommit(true);
    lazy.setDefaultTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
    lazy.afterPropertiesSet();
    return lazy;
  }
}
