package fr.acoss.posdoc.domain.ressource.secondary;

import fr.acoss.posdoc.domain.exemplaire.model.RessourceExistForOrganismeSiteQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvsOrgsAppProfilsQuery;
import fr.acoss.posdoc.domain.ressource.model.FindOrganismesByRessourceQuery;
import fr.acoss.posdoc.domain.ressource.model.Ressource;
import fr.acoss.posdoc.domain.ressource.model.RessourceCompositeIdModel;
import fr.acoss.posdoc.domain.ressource.model.RessourceGamSitRes;
import fr.acoss.posdoc.domain.ressource.model.SearchRessourceByEnvOrgAppProfilQuery;

import java.util.List;

public interface RessourcePersistence {

  List<Ressource> selectAll();

  List<Ressource> findByListOrgGam(List <String> codesOrg, List <String> codesGam);

  List<Ressource> findByAppEnv(final SearchByEnvsOrgsAppProfilsQuery query);

  Ressource create(Ressource ressource);

  boolean exists(Ressource ressource);
  boolean isGenericRessourceHasSpecifiqueOne(String codeOrganisme, Ressource ressource);
  boolean isSpecifiqueRessourceHasGenericOne(String codeOrganisme, Ressource ressource);

  List<String> gammesExistsInRessources(List<String> gammeCodes);

  Ressource update(Ressource ressource);

  void deleteAll(List<RessourceCompositeIdModel> ids);

  List<String> serversExistsInRessources(List<String> serverIds);

  List<String> parametreDistributionsExistsInRessource(List<String> parametreDistributionCodes);

  List<String> findOrganismesByRessource(FindOrganismesByRessourceQuery query);

  List<RessourceGamSitRes> findGamSitResByEnvOrgAppProfil(SearchRessourceByEnvOrgAppProfilQuery query, String genericOrganisme);

  boolean isRessourceExistForOrganismeSite(RessourceExistForOrganismeSiteQuery query);

  boolean isRessourceExist(RessourceExistForOrganismeSiteQuery query);
}
