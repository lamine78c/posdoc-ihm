package fr.acoss.posdoc.domain.application.secondary;

import fr.acoss.posdoc.domain.application.model.Application;
import fr.acoss.posdoc.domain.application.model.ApplicationComposite;
import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ApplicationPersistence {

  Paginated<Application> select(final QueryParameters queryParameters);

  List<Application> selectAll();
  List<Application> findApplicationsByEnv(List<String> codesEnv);

  boolean exists(String codenv, String codorg, String codapp);
  Application create(Application application);
  Application update(Application application);
  void deleteAll(Iterable<ApplicationComposite> ids);

  List<String> environnementsExistsInApplications(List<String> environnementCodes);
  List<String> organismesExistsInApplications(List<String> organismeCodes);

  List<String> findCodeApp();
  List<String> findCodeAppByEnvOrgs(String codenv, List<String> codorgs);
}
