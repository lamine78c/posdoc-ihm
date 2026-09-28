package fr.acoss.posdoc.domain.support.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.support.model.Support;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface SupportPersistence {

  Paginated<Support> select(QueryParameters queryParameters);

  List<Support> selectAll();

  boolean exists(String code);

  Support create(Support support);

  Support update(Support support);


  void deleteAll(Iterable<String> ids);
}
