package fr.acoss.posdoc.domain.environnement.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.environnement.model.Environnement;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface EnvironnementPersistence {

  Paginated<Environnement> select(final QueryParameters queryParameters);

  List<Environnement> selectAll();
  List<Environnement> selectAllInApplication();
  List<Environnement> selectAllInFichier();

  boolean exists(String code);

  Environnement create(Environnement environnement);

  Environnement update(Environnement environnement);

  void delete(String codes);

  void deleteAll(Iterable<String> ids);

    List<String> findCodeEnv();
}
