package fr.acoss.posdoc.domain.papaad.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.papaad.model.Papaad;
import fr.acoss.posdoc.domain.papaad.model.PapaadCompositeId;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface PapaadPersistence {

  Paginated<Papaad> select(final QueryParameters queryParameters);

  List<Papaad> selectAll();

  Papaad create(Papaad papaad);

  Papaad update(Papaad papaad);

  boolean exists(String codeCommande, String codeFichier, String codeNotif);

  List<Papaad> updateAll(List<Papaad> papaads);

  void deleteAll(Iterable<PapaadCompositeId> ids);

}
