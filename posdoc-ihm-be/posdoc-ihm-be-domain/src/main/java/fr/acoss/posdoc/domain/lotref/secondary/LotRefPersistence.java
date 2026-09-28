package fr.acoss.posdoc.domain.lotref.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.lotref.model.LotRef;
import fr.acoss.posdoc.types.Paginated;

public interface LotRefPersistence {

  Paginated<LotRef> select(final QueryParameters queryParameters);

  boolean exists(String code);

  LotRef create(LotRef lotRef);

  LotRef update(LotRef lotRef);

  void delete(String codes);
}
