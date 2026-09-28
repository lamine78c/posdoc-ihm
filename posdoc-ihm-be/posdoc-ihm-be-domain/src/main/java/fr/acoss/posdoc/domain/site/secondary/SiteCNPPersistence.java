package fr.acoss.posdoc.domain.site.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.site.model.SiteCNP;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface SiteCNPPersistence {

  Paginated<SiteCNP> select(final QueryParameters queryParameters);

  List<SiteCNP> selectAll();
  boolean exists(final String code);

  SiteCNP create(SiteCNP siteCNP);

  SiteCNP update(SiteCNP siteCNP);

  void delete(String code);

  void deleteAll(Iterable<String> ids);

  SiteCNP findById(final String code);

  List<String> findAllMasOrgs();
}
