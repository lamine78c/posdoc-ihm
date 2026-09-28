package fr.acoss.posdoc.domain.organisme.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.organisme.model.Organisme;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface OrganismePersistence {

  Paginated<Organisme> select(final QueryParameters queryParameters);

  List<Organisme> selectAll();

  boolean exists(final String organismeId);
  List<Organisme> findAllOrganismes();

  List<Organisme> organismesByRegions(List<String> regions);

  Organisme findById(final String code);

  Organisme create(Organisme organisme);

  Organisme update(Organisme organisme);

  void deleteAll(Iterable<String> codes);

  List<String> regionsExistsInOrganismes(List<String> regionCodes);

  List<String> sitesExistsInOrganismes(List<String> siteCodes);

  List<String> codesOrganismesByRegions(List<String> regions);

  List<String> findCodeOrganismesByTypeR();
}
