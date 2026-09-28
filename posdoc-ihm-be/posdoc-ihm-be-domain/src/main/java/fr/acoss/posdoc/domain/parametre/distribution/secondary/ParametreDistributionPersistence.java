package fr.acoss.posdoc.domain.parametre.distribution.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.parametre.distribution.model.ParametreDistribution;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ParametreDistributionPersistence {

  Paginated<ParametreDistribution> select(final QueryParameters queryParameters);

  List<ParametreDistribution> selectAll();

  ParametreDistribution create(ParametreDistribution parametreDistribution);

  ParametreDistribution update(ParametreDistribution parametreDistribution);

  void delete(String reference);

  void deleteAll(Iterable<String> ids);

  boolean exists(String reference);
}
