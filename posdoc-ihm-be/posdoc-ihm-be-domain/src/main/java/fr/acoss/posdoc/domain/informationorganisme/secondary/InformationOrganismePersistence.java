package fr.acoss.posdoc.domain.informationorganisme.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.informationorganisme.model.InformationOrganisme;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface InformationOrganismePersistence {

  Paginated<InformationOrganisme> select(final QueryParameters queryParameters);

  List<InformationOrganisme> create(List<InformationOrganisme> informationOrganismes);

  InformationOrganisme update(InformationOrganisme informationOrganisme);

  void delete(final Integer infoOrganismeIds);

  boolean exists(final Integer informationOrganismeId);

}
