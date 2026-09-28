package fr.acoss.posdoc.domain.fichier.secondary;

import fr.acoss.posdoc.domain.commande.model.CommandeComposite;
import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.fichier.model.CodComCodDocLibFicInFichier;
import fr.acoss.posdoc.domain.fichier.model.CodficRefimpCodprdDTO;
import fr.acoss.posdoc.domain.fichier.model.ComFichProdInFichier;
import fr.acoss.posdoc.domain.fichier.model.EnvAppRefImpInFichier;
import fr.acoss.posdoc.domain.fichier.model.EnvDocImpInFichier;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.model.FichierComposite;
import fr.acoss.posdoc.domain.fichier.model.query.EnvOrgsAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvOrgsAppComFicQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvOrgsAppComQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchFichierFilterQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchOrgByEnvAppComFicsQuery;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.produi.model.Produi;
import fr.acoss.posdoc.types.Paginated;

import java.util.HashMap;
import java.util.List;

public interface FichierPersistence {

  Paginated<Fichier> select(QueryParameters queryParameters);
  List<Fichier> setNewImprimeToFichiers(List<Fichier> fichier);
  Fichier setNewImprimeToFichier(Fichier fichier);
  List<Fichier> getFichiersForUpdatingReference(List<String> codesEnv, List<String> codesApp, List<String> refsImp);
  List<String> getFichiersToAddNewExemplaire(String codeEnv, String codeOrg, String codeApp, String perCod, String codeGam);
  List<Fichier> selectAll();
  boolean existsByCodeFic(String codeFichier);
  List<Fichier> findFichiersByApp(String codenv, List<String> codesOrg, List<String> codesApp, List<String> codesCom);
  boolean findFichierById(Fichier fichier);

  List<String> formatsExistsInFichiers(List<String> formatCodes);
  List<String> multifsExistsInFichiers(List<String> multifCodes);
  List<String> supportsExistsInFichiers(List<String> supportCodes);
  List<String> compositionsExistsInFichier(List<String> compositionCodes);

  List<String> echantillonsExistsInFichiers(List<String> echantillonCodes);

  List<String> commandesExistsInFichiers(List<CommandeComposite> commandeComposite);

  List<String> clientsExistsInFichiers(List<String> clientCodes);

  List<String> imprimesExistsInFichiers(List<String> imprimeCodes);

  List<Fichier> findFichiersForAdsNull(String codeEnv, String codeOrg, String codeApp, String codeCom, String codeFic, String refImprime);
  List<Fichier> getExistedFichiers(List<String> codeEnv, String codeApp, String codeCom, String codeFic);
  void deleteAll(List<Fichier> fichiers);
  List<Fichier> updateAll(List<Fichier> fichiers);

  HashMap<String, Integer> createFichierWithExemplaire(List<Fichier> fichiers, List<Produi> produits, List<Exemplaire> exemplaires);

  List<Fichier> checkIfExistInList(List<Fichier> fichiers);

  List<EnvAppRefImpInFichier> findEnvAppRefImpEnGroup();

  List<Fichier>  findFichierByProp(List<String> codeEnv, String codeApp, String codeCom, String codeFic);

  List<String> findDistinctEnvironnements();

  List<String> findDistOrgByEnv(SearchFichierFilterQuery query);

  List<String> findDistAppByEnvOrg(SearchFichierFilterQuery query);

  List<String> findDistComByEnvOrgApp(SearchFichierFilterQuery query);

  List<String> findDistFicByEnvOrgAppCom(SearchFichierFilterQuery query);

  List<Fichier> findPreselectedFichier(SearchFichierFilterQuery query);

  List<ComFichProdInFichier> getAllDistinctCodComCodFicCodPrd();

  List<EnvDocImpInFichier>  findFichiersByAppAndOrg(String codeOrg, String codeApp);

  List<String> getOrgByEnvAppComFics(SearchOrgByEnvAppComFicsQuery query);

  List<NotficFichier> findFichiersForAffectationNotice(SearchNotficQuery query);

  void updateFicAttByEnvOrgsAppComFic(SearchByEnvOrgsAppComFicQuery query, String message);

  void updateFicAttByEnvOrgsAppComFics(EnvOrgsAppComFicsQuery query, String message);

  List<String> findDistOrgNoMasByEnv(SearchFichierFilterQuery query);

  void updateFicAttByIds(List<FichierComposite> ids, String message);

  List<CodComCodDocLibFicInFichier> findComDocLibFicInFichier();

  List<CodficRefimpCodprdDTO> findFicPrdImpByEnvOrgAppCom(SearchByEnvOrgsAppComQuery query);
}
