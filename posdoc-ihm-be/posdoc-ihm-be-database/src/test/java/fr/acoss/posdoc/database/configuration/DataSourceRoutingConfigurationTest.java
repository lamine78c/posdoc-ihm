package fr.acoss.posdoc.database.configuration;

import fr.acoss.posdoc.database.aspect.AccessTypeContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

class DataSourceRoutingConfigurationTest {

  @AfterEach
  void clearContext() {
    AccessTypeContext.clear();
  }

  // ------------------------------------------------------------------
  // Mode JNDI
  // ------------------------------------------------------------------

  @Test
  void jndi_mode_disabled_when_property_absent() {
    new ApplicationContextRunner()
        .withUserConfiguration(DataSourceRoutingJndiConfiguration.class)
        .run(ctx -> assertThat(ctx).doesNotHaveBean(DataSource.class));
  }

  @Test
  void jndi_mode_disabled_when_property_is_direct() {
    new ApplicationContextRunner()
        .withUserConfiguration(DataSourceRoutingJndiConfiguration.class)
        .withPropertyValues("posdoc.datasource.mode=direct")
        .run(ctx -> assertThat(ctx).doesNotHaveBean(DataSource.class));
  }

  // ------------------------------------------------------------------
  // Mode direct (dev local) — testé en remplaçant le bean par une variante
  // qui injecte des DataSources mockées (on ne va pas instancier de vrai pool Hikari).
  // ------------------------------------------------------------------

  @Test
  void direct_mode_builds_lazy_proxy_wrapping_routing_with_two_distinct_targets() {
    new ApplicationContextRunner()
        .withUserConfiguration(MockedDirectConfiguration.class)
        .withPropertyValues("posdoc.datasource.mode=direct")
        .run(ctx -> {
          assertThat(ctx).hasSingleBean(DataSource.class);
          final DataSource ds = ctx.getBean(DataSource.class);

          assertThat(ds)
              .as("La DataSource @Primary doit être enveloppée par un LazyConnectionDataSourceProxy")
              .isInstanceOf(LazyConnectionDataSourceProxy.class);

          final var routing = (RoutingDataSource) ((LazyConnectionDataSourceProxy) ds).getTargetDataSource();

          final DataSource write = routing.dataSourceForKey(AccessType.READ_WRITE);
          final DataSource read = routing.dataSourceForKey(AccessType.READ_ONLY);

          assertThat(write).isNotNull();
          assertThat(read).isNotNull();
          assertThat(write).as("Les DataSources RW et RO doivent être distinctes").isNotSameAs(read);
        });
  }

  @Test
  void routing_returns_default_when_thread_local_is_null() {
    new ApplicationContextRunner()
        .withUserConfiguration(MockedDirectConfiguration.class)
        .withPropertyValues("posdoc.datasource.mode=direct")
        .run(ctx -> {
          final var ds = (LazyConnectionDataSourceProxy) ctx.getBean(DataSource.class);
          final var routing = (RoutingDataSource) ds.getTargetDataSource();

          AccessTypeContext.clear();
          // determineCurrentLookupKey retourne null → AbstractRoutingDataSource utilise le defaultTargetDataSource
          assertThat(routing.determineCurrentLookupKey()).isNull();
        });
  }

  @Test
  void routing_returns_read_only_key_when_thread_local_is_set() {
    new ApplicationContextRunner()
        .withUserConfiguration(MockedDirectConfiguration.class)
        .withPropertyValues("posdoc.datasource.mode=direct")
        .run(ctx -> {
          final var ds = (LazyConnectionDataSourceProxy) ctx.getBean(DataSource.class);
          final var routing = (RoutingDataSource) ds.getTargetDataSource();

          AccessTypeContext.set(AccessType.READ_ONLY);
          assertThat(routing.determineCurrentLookupKey()).isEqualTo(AccessType.READ_ONLY);
        });
  }

  /**
   * Configuration de test qui s'active sous les mêmes conditions que
   * DataSourceRoutingDevConfiguration mais qui injecte 2 DataSources mockées
   * (évite la création de vrais pools HikariCP qui chercheraient à se connecter).
   */
  @Configuration
  @org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
      prefix = "posdoc.datasource", name = "mode", havingValue = "direct")
  static class MockedDirectConfiguration {

    @Bean
    @org.springframework.context.annotation.Primary
    DataSource dataSource() {
      final DataSource write = Mockito.mock(DataSource.class, "writeDataSource");
      final DataSource read = Mockito.mock(DataSource.class, "readDataSource");
      return DataSourceRoutingJndiConfiguration.buildRouting(write, read);
    }
  }
}
