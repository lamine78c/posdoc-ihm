package fr.acoss.posdoc.database.configuration;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * Routing en mode dev local : deux pools HikariCP sur la même base, différenciés
 * par l'ApplicationName dans l'URL JDBC. Permet d'observer le routing via
 * pg_stat_activity côté PostgreSQL sans dépendre de JNDI Tomcat.
 */
@Configuration
@ConditionalOnProperty(prefix = "posdoc.datasource", name = "mode", havingValue = "direct")
public class DataSourceRoutingDevConfiguration {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceRoutingDevConfiguration.class);

  @Bean
  @Primary
  public DataSource dataSource(
      @Value("${posdoc.datasource.write.url}") final String writeUrl,
      @Value("${posdoc.datasource.read.url}") final String readUrl,
      @Value("${posdoc.datasource.username}") final String username,
      @Value("${posdoc.datasource.password}") final String password) {

    LOGGER.info("Routing DataSource (direct) : write & read pools HikariCP");

    final DataSource write = hikari("posdoc-rw", writeUrl, username, password);
    final DataSource read = hikari("posdoc-ro", readUrl, username, password);

    return DataSourceRoutingJndiConfiguration.buildRouting(write, read);
  }

  private static DataSource hikari(final String poolName, final String url, final String user, final String pwd) {
    final var cfg = new HikariConfig();
    cfg.setPoolName(poolName);
    cfg.setJdbcUrl(url);
    cfg.setUsername(user);
    cfg.setPassword(pwd);
    cfg.setMaximumPoolSize(15);
    cfg.setMinimumIdle(5);
    cfg.setConnectionTimeout(30_000);
    cfg.setMaxLifetime(1_800_000);
    cfg.setIdleTimeout(600_000);
    cfg.setValidationTimeout(5_000);
    cfg.setLeakDetectionThreshold(20_000);
    return new HikariDataSource(cfg);
  }
}
