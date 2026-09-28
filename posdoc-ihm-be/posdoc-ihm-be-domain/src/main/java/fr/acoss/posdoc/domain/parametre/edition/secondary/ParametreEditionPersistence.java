package fr.acoss.posdoc.domain.parametre.edition.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.parametre.distribution.model.CodeEnvOrgsAppPayload;
import fr.acoss.posdoc.domain.parametre.distribution.model.RessourceCodeEnvOrgsAppDTO;
import fr.acoss.posdoc.domain.parametre.edition.model.ParametreEdition;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ParametreEditionPersistence {

  Paginated<ParametreEdition> select(final QueryParameters queryParameters);
  List<ParametreEdition> selectAll();

  boolean exists(String code);

  ParametreEdition create(ParametreEdition composition);

  ParametreEdition update(ParametreEdition composition);

  void deleteAll(List<String> ids);

  List<String> formatsExistsInparametresEditions(List<String> formatCodes);

  List<RessourceCodeEnvOrgsAppDTO> getRessourcesByCodeEnvOrgsApp(CodeEnvOrgsAppPayload codeEnvOrgsAppPayload);

  List<String> getCodeDestinatairesByCodeOrgs(List<String> codeOrgs);
}
