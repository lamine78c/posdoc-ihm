package fr.acoss.posdoc.domain.verrou.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.verrou.model.Verrou;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface VerrouPersistence {

  Paginated<Verrou> select(final QueryParameters queryParameters);

  List<Verrou> selectAll();

  boolean exists(String code);

  Verrou create(Verrou verrou);

  Verrou update(Verrou verrou);

  void delete(String code);

  void deleteAll(Iterable<String> ids);
}
