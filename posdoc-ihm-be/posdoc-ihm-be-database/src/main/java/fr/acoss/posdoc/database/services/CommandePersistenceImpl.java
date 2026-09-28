package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.CommandeRepository;
import fr.acoss.posdoc.database.entities.CommandeCompositeId;
import fr.acoss.posdoc.database.entities.CommandeEntity;
import fr.acoss.posdoc.database.mappers.CommandeMapper;
import fr.acoss.posdoc.domain.application.model.ApplicationComposite;
import fr.acoss.posdoc.domain.commande.model.CodLibCommandeDTO;
import fr.acoss.posdoc.domain.commande.model.Commande;
import fr.acoss.posdoc.domain.commande.model.CommandeComposite;
import fr.acoss.posdoc.domain.commande.model.CommandeFiltersPayload;
import fr.acoss.posdoc.domain.commande.model.CommandeForCompare;
import fr.acoss.posdoc.domain.commande.secondary.CommandePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CommandePersistenceImpl
    extends AbstractObjectPersistence<CommandeEntity, CommandeCompositeId, Commande>
    implements CommandePersistence {

  private static final CommandeMapper ORG_MAPPER = CommandeMapper.INSTANCE;

  private final CommandeRepository commandeRepository;

  public CommandePersistenceImpl(CommandeRepository commandeRepository) {
    this.commandeRepository = commandeRepository;
  }

  @Override
  protected JpaSpecificationExecutor<CommandeEntity> getSpecificationExecutor() {
    return commandeRepository;
  }

  @Override
  protected JpaRepository<CommandeEntity, CommandeCompositeId> getRepository() {
    return commandeRepository;
  }

  @Override
  protected Function<CommandeEntity, Commande> entityToDomainFunction() {
    return ORG_MAPPER::entityToDomain;
  }

  @Override
  protected Function<Commande, CommandeEntity> domainToEntityFunction() {
    return ORG_MAPPER::domainToEntity;
  }

  @Override
  public void delete( String codenv,  String codorg, String codapp,  String code) {
    delete(new CommandeCompositeId(codenv, codorg,codapp, code));
  }

  @Override
  public boolean exists( String codenv,  String codorg, String codapp,  String code) {
    return exists(new CommandeCompositeId(codenv, codorg,codapp, code));
  }

  @Override
  public boolean existsByCode( String code) {
    return commandeRepository.existsByCode(code);
  }

  @Override
  public List<Commande> findCommandesByApp(String codenv, List<String> codesOrg, List<String> codesApp) {
    List<CommandeEntity>  commandeEntityList = commandeRepository.findCommandesByApp(codenv,codesOrg,codesApp);
    return commandeEntityList.stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<CommandeForCompare> compareCommandes(List<String> codesEnv, List<String> codesOrg, List<String> codesApp) {
    return commandeRepository.compareCommandes(codesEnv, codesOrg, codesApp)
            .stream()
            .map(e -> CommandeForCompare
                    .builder()
                    .application(e.get("application"))
                    .organisme(e.get("organisme"))
                    .codeReg(e.get("codereg"))
                    .sortHelper(e.get("sorthelper"))
                    .environnements(e.get("environnements"))
                    .build())
            .collect(Collectors.toList());
  }

  @Override
  public List<String> findDistinctApplications() {
    return commandeRepository.getDistinctApplication();
  }

  @Override
  public List<String> findDistinctEnvsByApp(String app) {
    return commandeRepository.findDistinctEnvsByApp(app);
  }

  @Override
  public List<String> findDistinctCommByAppEnv(String app, List<String> env) {
    return commandeRepository.findDistinctCommByAppEnv(app, env);
  }

  @Override
  public List<Commande> updateAll(List<Commande> commandes) {
    var entity = commandes.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
    return commandeRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<CommandeComposite> ids) {
    List<CommandeCompositeId> deletes = new ArrayList<>();
    ids.forEach(e-> deletes.add(new CommandeCompositeId(  e.getCodenv(),e.getCodorg(),e.getCodapp() , e.getCode())));
    commandeRepository.deleteByIdIn(deletes);
  }

  @Override
  public boolean applicationsExistsInCommandes(List<ApplicationComposite> applications) {
    return applications.stream().anyMatch(application -> commandeRepository
            .applicationExistInCommande(application.getCode(), application.getCodeOrganisation(),
                    application.getCodeEnvironnement()));
  }

  @Override
  public List<Commande> findCommandbyProp(List<String> codeEnv, String codeApp, String codeCom) {

    return commandeRepository.findCommandByProp(codeEnv, codeApp, codeCom)
            .stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<String> findDistinctEnvironnements() {
    return commandeRepository.getDistinctEnvironnement();
  }

  @Override
  public List<String> findDistOrgByEnv(List<String> envs) {
    return commandeRepository.findDistOrgByEnv(envs);
  }

  @Override
  public List<String> findDistAppByEnvOrg(List<String> envs, List<String> orgs) {
    return commandeRepository.findDistAppByEnvOrg(envs, orgs);
  }

  @Override
  public List<String> findDistOrgByEnvsAndAppsFromCommande(List<String> envs, List<String> apps) {
    return commandeRepository.findDistOrgByEnvsAndAppsFromCommande(envs, apps);
  }

  @Override
  public List<String> findDistAppByEnvsFromCommande(List<String> envs) {
    return commandeRepository.findDistAppByEnvsFromCommande(envs);
  }

  @Override
  public List<Commande> getPreselectedCommande(List<String> envs, List<String> orgs, String app) {
    return commandeRepository.findPreselectedCommande(envs, orgs, app);
  }

  @Override
  public List<Commande> getCommandesByEnvsOrgsApps(List<String> envs, List<String> orgs, String app) {
    return commandeRepository.getCommandesByEnvsOrgsApps(envs, orgs, app);
  }

  @Override
  public List<CodLibCommandeDTO> getCodLibCommandeByEnvOrgApp(CommandeFiltersPayload filters) {
    return commandeRepository.getCodLibCommandeByEnvOrgApp(filters)
            .stream()
            .map(row -> new CodLibCommandeDTO((String) row[0], (String) row[1]))
            .collect(Collectors.toList());
  }
}
