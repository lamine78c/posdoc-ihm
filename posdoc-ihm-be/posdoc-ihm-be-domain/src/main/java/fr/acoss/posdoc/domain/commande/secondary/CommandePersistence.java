package fr.acoss.posdoc.domain.commande.secondary;

import fr.acoss.posdoc.domain.application.model.ApplicationComposite;
import fr.acoss.posdoc.domain.commande.model.CodLibCommandeDTO;
import fr.acoss.posdoc.domain.commande.model.Commande;
import fr.acoss.posdoc.domain.commande.model.CommandeComposite;
import fr.acoss.posdoc.domain.commande.model.CommandeFiltersPayload;
import fr.acoss.posdoc.domain.commande.model.CommandeForCompare;
import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface CommandePersistence {

  Paginated<Commande> select(final QueryParameters queryParameters);
  List<Commande> findCommandesByApp(String codenv,List<String> codesOrg, List<String> codesApp);
  List<CommandeForCompare> compareCommandes(List<String> codesEnv, List<String> codesOrg, List<String> codesApp);
  List<String> findDistinctApplications();
  List<String> findDistinctEnvsByApp(String app);
  List<String> findDistinctCommByAppEnv(String app, List<String> envs);
  Commande create(Commande commande);
  boolean exists( String codenv,  String codorg, String codapp,  String code);
  boolean existsByCode( String code);
  void delete(String codenv,String codorg,String codapp,String code);

  Commande update(Commande commande);

  List<Commande> updateAll(List<Commande> commandes);
  void deleteAll(Iterable<CommandeComposite> ids);

  boolean applicationsExistsInCommandes(List<ApplicationComposite> applications);

  List<Commande> findCommandbyProp(List<String> codeEnv, String codeApp, String codeCom);

  List<String> findDistinctEnvironnements();

  List<String> findDistOrgByEnv(List<String> envs);

  List<String> findDistAppByEnvOrg(List<String> envs, List<String> orgs);

  List<String> findDistOrgByEnvsAndAppsFromCommande(List<String> envs, List<String> apps);

  List<String> findDistAppByEnvsFromCommande(List<String> envs);

  List<Commande> getPreselectedCommande(List<String> envs, List<String> orgs, String app);

  List<Commande> getCommandesByEnvsOrgsApps(List<String> envs, List<String> orgs, String app);

  List<CodLibCommandeDTO> getCodLibCommandeByEnvOrgApp(CommandeFiltersPayload filters);
}
