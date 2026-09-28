package fr.acoss.posdoc.domain.parametre.echantillon.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.parametre.echantillon.model.ParametreEchantillon;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ParametreEchantillonPersistence {

  Paginated<ParametreEchantillon> select(final QueryParameters queryParameters);

  List<ParametreEchantillon> selectAll();

  ParametreEchantillon create(ParametreEchantillon parametreDistribution);

  ParametreEchantillon update(ParametreEchantillon parametreDistribution);

  void delete(String reference);

  boolean exists(String reference);

  void deleteAll(List<String> ids);
}
