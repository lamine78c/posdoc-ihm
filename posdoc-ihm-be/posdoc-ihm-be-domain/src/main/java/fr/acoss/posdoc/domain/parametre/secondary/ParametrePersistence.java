package fr.acoss.posdoc.domain.parametre.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.parametre.model.Parametre;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ParametrePersistence {

  Paginated<Parametre> select(final QueryParameters queryParameters);

  List<Parametre> selectAll();

  Parametre create(Parametre parametre);

  Parametre update(Parametre parametre);

  boolean exists(String code);

  void delete(String code);

  void deleteAll(Iterable<String> ids);

  String getAdelaideVersion();

  String getCodeGamme();

  //TODO gérer cette avec un cash pour éviter d'exécuter la requête à chaque action.
  String getValueByCode(String code);

  List<Parametre> getParamsForMasappMasgamMasuti();

  String getValueDocDematerialises();

}
