package fr.acoss.posdoc.domain.imprime.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.imprime.model.Imprime;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ImprimePersistence {

  Paginated<Imprime> select(QueryParameters queryParameters);
  List<Imprime> selectAll();
  List<Imprime> findImprimesByEnvsAndApps(List<String> codesEnv, List<String> codesApp);
  Imprime create(Imprime imprime);

  Imprime update(Imprime imprime);

  boolean exists(String reference);

  void delete(String reference);
  List<String> compositionsExistsInImprime(List<String> compositionCodes);

  void deleteAll(List<String> ids);
}
