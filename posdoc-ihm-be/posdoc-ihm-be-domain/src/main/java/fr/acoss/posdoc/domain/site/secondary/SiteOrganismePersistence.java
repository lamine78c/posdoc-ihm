package fr.acoss.posdoc.domain.site.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.site.model.SiteOrganisme;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface SiteOrganismePersistence {

  Paginated<SiteOrganisme> select(final QueryParameters queryParameters);

  boolean exists(String code);

  SiteOrganisme create(SiteOrganisme siteOrganisme);

  SiteOrganisme update(SiteOrganisme siteOrganisme);

  void delete(String code);

  List<SiteOrganisme> selectAll();
}
