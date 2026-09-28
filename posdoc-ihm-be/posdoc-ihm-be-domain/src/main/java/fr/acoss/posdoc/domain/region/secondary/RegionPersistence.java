package fr.acoss.posdoc.domain.region.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.region.model.Region;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface RegionPersistence {

  Paginated<Region> select(final QueryParameters queryParameters);

  List<Region> selectAll();

  Region create(Region region);

  Region update(Region region);

  void delete(String region);

  boolean exists(String region);

  List<Region> updateAll(List<Region> regions);

  void deleteAll(Iterable<String> ids);
}
