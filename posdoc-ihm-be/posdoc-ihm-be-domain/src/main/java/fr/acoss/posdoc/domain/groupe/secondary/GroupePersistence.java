
package fr.acoss.posdoc.domain.groupe.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.groupe.model.Groupe;
import fr.acoss.posdoc.types.Paginated;

public interface GroupePersistence {

  Paginated<Groupe> select(final QueryParameters queryParameters);


}
