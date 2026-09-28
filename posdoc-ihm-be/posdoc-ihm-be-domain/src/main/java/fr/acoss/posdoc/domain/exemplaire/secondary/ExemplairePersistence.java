package fr.acoss.posdoc.domain.exemplaire.secondary;

import fr.acoss.posdoc.domain.common.search.FilterCriteriaSort;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireCompositeIdModel;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByFilterQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByResource;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireComposite;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireExistsQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichier;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichierCodficRefimpCodprdDTO;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireGammeSiteRessourceDTO;
import fr.acoss.posdoc.domain.exemplaire.model.FindExemplaireQuery;
import fr.acoss.posdoc.domain.exemplaire.model.FindOrganismesByExemplaireQuery;
import fr.acoss.posdoc.domain.exemplaire.model.query.ExemplaireByRessourceQuery;
import fr.acoss.posdoc.domain.produi.model.Produi;
import fr.acoss.posdoc.domain.ressource.model.RessourceCompositeIdModel;

import java.util.List;

public interface ExemplairePersistence {

  List<String> findDistinctEnvironnements();

  List<String> findDistOrgByEnv(List<String> envs);

  List<String> findDistAppByEnvOrg(List<String> envs, List<String> orgs);

  List<String> findDistComByEnvOrgApp(List<String> envs, List<String> orgs, String app);

  List<ExemplaireFichierCodficRefimpCodprdDTO> findDistFicByEnvOrgAppCom(ExemplaireByFilterQuery query);

  List<ExemplaireGammeSiteRessourceDTO> findDistRessourceByEnvOrgAppComFic(ExemplaireByFilterQuery query);

  List<ExemplaireFichier> findPreselectedExemplaire(ExemplaireByFilterQuery query, String genericOrganisme);

  List<Exemplaire> selectAll();

  List<Exemplaire> selectAll(final FilterCriteriaSort filterCriteriaSort);

  List<Exemplaire> findExemplaires(FindExemplaireQuery query);

  Exemplaire create(Exemplaire exemplaire);

  Exemplaire update(Exemplaire exemplaire);

  void delete(final String codenv, final String codorg, final String codapp, final String codcom, final String codfic, final String codgam, final String numexe );

  boolean exists( String codenv, String codorg, String codapp, String codcom, String codfic, String codgam, String numexe );

  boolean destinataireExistInExemplaires(DestinataireCompositeIdModel destinataireId);

  List<Exemplaire> updateAll(List<Exemplaire> exemplaires);

  void deleteAll(Iterable<ExemplaireComposite> ids);

  boolean ressourceExistsInExemplaires(RessourceCompositeIdModel ressourceId);
  Boolean isProductAttachedToExemplaire(Produi product);

  boolean ressourceExists(ExemplaireExistsQuery query);

  List<Exemplaire> findExemplairesByCriteres(String codenv, String codorg, String codapp, String codcom, String codfic, String codgam);

  List<String> findOrganismeCompleteByExemplaire(FindOrganismesByExemplaireQuery query);

  boolean exemplaireExists(ExemplaireExistsQuery query);

  boolean isAllExemplaireInProduitDesactives(final Produi product);

  List<ExemplaireByResource> getParametresEditionByRessource(ExemplaireByRessourceQuery query, String genericOrganisme);

  String getNumexeFromExemplaire(ExemplaireComposite id, String codres, String codsit);
}
