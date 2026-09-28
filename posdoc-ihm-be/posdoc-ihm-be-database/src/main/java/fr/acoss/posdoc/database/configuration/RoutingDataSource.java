package fr.acoss.posdoc.database.configuration;

import fr.acoss.posdoc.database.aspect.AccessTypeContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.Map;

public class RoutingDataSource extends AbstractRoutingDataSource {

  private static final Logger LOGGER = LoggerFactory.getLogger(RoutingDataSource.class);

  private Map<Object, Object> targetDataSources;

  @Override
  protected Object determineCurrentLookupKey() {

    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("Utilisation de la datasource {}", AccessTypeContext.get());
    }

    return AccessTypeContext.get();
  }

  @Override
  public void setTargetDataSources(Map<Object, Object> targetDataSources) {
    this.targetDataSources = targetDataSources;
    super.setTargetDataSources(targetDataSources);
  }

  public DataSource dataSourceForKey(final Object key) {
    return (DataSource) targetDataSources.get(key);
  }

}
