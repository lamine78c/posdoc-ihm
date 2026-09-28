package fr.acoss.posdoc.domain.gammes.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.gammes.model.Gamme;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface GammePersistence {

  Paginated<Gamme> select(final QueryParameters queryParameters);

  List<Gamme> selectAll();

  Gamme create(Gamme gamme);

  Gamme update(Gamme gamme);

  void delete(final String codes);

  boolean exists(String code);

  void deleteAll(List<String> ids);

  List<Gamme> updateAll(List<Gamme> gammes);

  List<String> existsVerrous(List<String> codes);
}
