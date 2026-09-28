package fr.acoss.posdoc.ws.configuration;

import fr.acoss.posdoc.domain.adresseretour.primary.AdresseRetourService;
import fr.acoss.posdoc.domain.adresseretour.secondary.AdresseRetourPersistence;
import fr.acoss.posdoc.domain.application.parimary.ApplicationService;
import fr.acoss.posdoc.domain.application.secondary.ApplicationPersistence;
import fr.acoss.posdoc.domain.client.primary.ClientService;
import fr.acoss.posdoc.domain.client.secondary.ClientPersistence;
import fr.acoss.posdoc.domain.commande.primary.CommandeService;
import fr.acoss.posdoc.domain.commande.secondary.CommandePersistence;
import fr.acoss.posdoc.domain.composition.primary.CompositionService;
import fr.acoss.posdoc.domain.composition.secondary.CompositionPersistence;
import fr.acoss.posdoc.domain.contenu.primary.ContenuService;
import fr.acoss.posdoc.domain.contenu.secondary.ContenuPersistence;
import fr.acoss.posdoc.domain.destinataire.primary.DestinataireService;
import fr.acoss.posdoc.domain.destinataire.secondary.DestinatairePersistence;
import fr.acoss.posdoc.domain.environnement.primary.EnvironnementService;
import fr.acoss.posdoc.domain.environnement.secondary.EnvironnementPersistence;
import fr.acoss.posdoc.domain.exemplaire.primary.ExemplaireService;
import fr.acoss.posdoc.domain.exemplaire.secondary.ExemplairePersistence;
import fr.acoss.posdoc.domain.facturationdetaillee.primary.FacturationDetailleeService;
import fr.acoss.posdoc.domain.facturationdetaillee.secondary.FacturationDetailleePersistence;
import fr.acoss.posdoc.domain.fichier.primary.FichierService;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.format.primary.FormatService;
import fr.acoss.posdoc.domain.format.secondary.FormatPersistence;
import fr.acoss.posdoc.domain.gammes.primary.GammeService;
import fr.acoss.posdoc.domain.gammes.secondary.GammePersistence;
import fr.acoss.posdoc.domain.genapp.primary.GenAppService;
import fr.acoss.posdoc.domain.genapp.secondary.GenAppPersistence;
import fr.acoss.posdoc.domain.genetp.primary.GenEtpService;
import fr.acoss.posdoc.domain.genetp.secondary.GenEtpPersistence;
import fr.acoss.posdoc.domain.habilitation.primary.HabilitationService;
import fr.acoss.posdoc.domain.habilitation.secondary.HabilitationPersistence;
import fr.acoss.posdoc.domain.help.primary.HelpService;
import fr.acoss.posdoc.domain.help.secondary.HelpPersistence;
import fr.acoss.posdoc.domain.history.primary.HistoryService;
import fr.acoss.posdoc.domain.history.secondary.HistoryPersistence;
import fr.acoss.posdoc.domain.imprime.primary.ImprimeService;
import fr.acoss.posdoc.domain.imprime.secondary.ImprimePersistence;
import fr.acoss.posdoc.domain.informationorganisme.primary.InformationOrganismeService;
import fr.acoss.posdoc.domain.informationorganisme.secondary.InformationOrganismePersistence;
import fr.acoss.posdoc.domain.joblock.primary.JobLockService;
import fr.acoss.posdoc.domain.joblock.secondary.JobLockPersistence;
import fr.acoss.posdoc.domain.massification.primary.MassificationService;
import fr.acoss.posdoc.domain.massification.secondary.MassificationPersistence;
import fr.acoss.posdoc.domain.multif.primary.MultifService;
import fr.acoss.posdoc.domain.multif.secondary.MultifPersistence;
import fr.acoss.posdoc.domain.organisme.primary.OrganismeService;
import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.domain.papaad.primary.PapaadService;
import fr.acoss.posdoc.domain.papaad.secondary.PapaadPersistence;
import fr.acoss.posdoc.domain.parametre.distribution.primary.ParametreDistributionService;
import fr.acoss.posdoc.domain.parametre.distribution.secondary.ParametreDistributionPersistence;
import fr.acoss.posdoc.domain.parametre.echantillon.primary.ParametreEchantillonService;
import fr.acoss.posdoc.domain.parametre.echantillon.secondary.ParametreEchantillonPersistence;
import fr.acoss.posdoc.domain.parametre.edition.primary.ParametreEditionService;
import fr.acoss.posdoc.domain.parametre.edition.secondary.ParametreEditionPersistence;
import fr.acoss.posdoc.domain.parametre.primary.ParametreService;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.pathhabili.primary.PathHabiliService;
import fr.acoss.posdoc.domain.pathhabili.secondary.PathHabiliPersistence;
import fr.acoss.posdoc.domain.productionflux.primary.ProductionFluxService;
import fr.acoss.posdoc.domain.productionflux.secondary.ProductionFluxPersistance;
import fr.acoss.posdoc.domain.produi.secondary.ProduiPersistence;
import fr.acoss.posdoc.domain.profile.primary.ProfileService;
import fr.acoss.posdoc.domain.profile.secondary.ProfilePersistence;
import fr.acoss.posdoc.domain.region.primary.RegionService;
import fr.acoss.posdoc.domain.region.secondary.RegionPersistence;
import fr.acoss.posdoc.domain.regionmapping.primary.RegionMappingService;
import fr.acoss.posdoc.domain.regionmapping.secondary.RegionMappingPersistence;
import fr.acoss.posdoc.domain.ressource.primary.RessourceService;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.domain.server.primary.ServerService;
import fr.acoss.posdoc.domain.server.secondary.ServerPersistence;
import fr.acoss.posdoc.domain.serviceposdoc.primary.ServicePosdocService;
import fr.acoss.posdoc.domain.serviceposdoc.secondary.ServicePosdocPersistence;
import fr.acoss.posdoc.domain.site.primary.SiteService;
import fr.acoss.posdoc.domain.site.secondary.SiteCNPPersistence;
import fr.acoss.posdoc.domain.site.secondary.SiteOrganismePersistence;
import fr.acoss.posdoc.domain.support.primary.SupportService;
import fr.acoss.posdoc.domain.support.secondary.SupportPersistence;
import fr.acoss.posdoc.domain.tarif.primary.TarifService;
import fr.acoss.posdoc.domain.tarif.secondary.TarifPersistence;
import fr.acoss.posdoc.domain.tarpos.primary.TarposService;
import fr.acoss.posdoc.domain.tarpos.secondary.TarposPersistence;
import fr.acoss.posdoc.domain.utilisateur.primary.UtilisateurService;
import fr.acoss.posdoc.domain.utilisateur.secondary.AnaisUserProviderPersistence;
import fr.acoss.posdoc.domain.utilisateur.secondary.UtilisateurPersistence;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.domain.utilog.secondary.UtiLogPersistence;
import fr.acoss.posdoc.domain.verrou.primary.VerrouService;
import fr.acoss.posdoc.domain.verrou.secondary.VerrouPersistence;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainConfiguration {

  @Bean
  public InformationOrganismeService informationOrganismeService(
      final OrganismePersistence organismePersistence,
      final InformationOrganismePersistence informationOrganismePersistence) {
    return new InformationOrganismeService(informationOrganismePersistence, organismePersistence);
  }

  @Bean
  public EnvironnementService environnementService(
      final EnvironnementPersistence environnementPersistence,
      final ApplicationPersistence applicationPersistence
  ) {
    return new EnvironnementService(environnementPersistence, applicationPersistence);
  }

  @Bean
  public GammeService gammeService(
          final GammePersistence gammePersistence,
          final ProduiPersistence produiPersistence,
          final RessourcePersistence ressourcePersistence
  ) {
    return new GammeService(gammePersistence, ressourcePersistence, produiPersistence);
  }

  @Bean
  public UtilisateurService utilisateurService(final UtilisateurPersistence utilisateurPersistence) {
    return new UtilisateurService(utilisateurPersistence);
  }

  @Bean
  public ProfileService profileService(final ProfilePersistence profilePersistence) {
    return new ProfileService(profilePersistence);
  }

  @Bean
  public ServerService serverService(
          final ServerPersistence serverPersistence,
          final RessourcePersistence ressourcePersistence
  ) {
    return new ServerService(serverPersistence, ressourcePersistence);
  }

  @Bean
  public HabilitationService habilitationService(final HabilitationPersistence habilitationPersistence) {
    return new HabilitationService(habilitationPersistence);
  }

  @Bean
  public ClientService clientService(
          final ClientPersistence clientPersistence,
          final FichierPersistence fichierPersistence
  ) {
    return new ClientService(clientPersistence, fichierPersistence);
  }

  @Bean
  public TarifService tarifService(final TarifPersistence tarifPersistence) {
    return new TarifService(tarifPersistence);
  }

  @Bean
  public ParametreService parametreService(final ParametrePersistence parametrePersistence) {
    return new ParametreService(parametrePersistence);
  }

  @Bean
  public ParametreDistributionService parametreResourceService(
      final ParametreDistributionPersistence parametreDistributionPersistence,
      final RessourcePersistence ressourcePersistence
  ) {
    return new ParametreDistributionService(parametreDistributionPersistence, ressourcePersistence);
  }

  @Bean
  public VerrouService verrouService(final VerrouPersistence verrouPersistence, final GammePersistence gammePersistence) {
    return new VerrouService(verrouPersistence, gammePersistence);
  }

  @Bean
  public RegionService regionService(
          final RegionPersistence regionPersistence,
          final OrganismePersistence organismePersistence
  ) {
    return new RegionService(regionPersistence, organismePersistence);
  }

  @Bean
  public SiteService siteService(
          final SiteCNPPersistence siteCNPPersistence,
          final SiteOrganismePersistence siteOrganismePersistence,
          final OrganismePersistence organismePersistence
  ) {
    return new SiteService(siteCNPPersistence, siteOrganismePersistence, organismePersistence);
  }

  @Bean
  public SupportService supportService(final SupportPersistence supportPersistence, final FichierPersistence fichierPersistence) {
    return new SupportService(supportPersistence, fichierPersistence);
  }

  @Bean
  public ImprimeService imprimeService(
          final ImprimePersistence imprimePersistence,
          final FichierPersistence fichierPersistence
          ) {
    return new ImprimeService(imprimePersistence, fichierPersistence);
  }

  @Bean
  public ParametreEchantillonService parametreEchantillonService(
      final ParametreEchantillonPersistence parametreEchantillonPersistence,
      final FichierPersistence fichierPersistence
    ) {
    return new ParametreEchantillonService(parametreEchantillonPersistence, fichierPersistence);
  }
  @Bean
  public CompositionService compositionService(
          final CompositionPersistence compositionPersistence,
          final ImprimePersistence imprimePersistence,
          final FichierPersistence fichierPersistence
  ) {
    return new CompositionService(compositionPersistence, imprimePersistence, fichierPersistence);
  }

  @Bean
  public FormatService formatService(
          final FormatPersistence formatPersistence, final FichierPersistence fichierPersistence,
          final ParametreEditionPersistence parametreEditionPersistence) {
    return new FormatService(formatPersistence, fichierPersistence, parametreEditionPersistence);
  }
  @Bean
  public ParametreEditionService parametreEditionService(
          final ParametreEditionPersistence parametreEditionPersistence, final FormatPersistence formatPersistence) {
    return new ParametreEditionService(parametreEditionPersistence, formatPersistence);
  }

  @Bean
  public MultifService multifService(
          final MultifPersistence multifPersistence, final FichierPersistence fichierPersistence) {
    return new MultifService(multifPersistence, fichierPersistence);
  }

  @Bean
  public AdresseRetourService adresseRetourService(
          final AdresseRetourPersistence adresseRetourPersistence) {
    return new AdresseRetourService(adresseRetourPersistence);
  }

  @Bean
  public CommandeService commandeService(
          final CommandePersistence commandePersistence, FichierPersistence fichierPersistence) {
    return new CommandeService(commandePersistence,fichierPersistence);
  }

  @Bean
  public DestinataireService destinataireService(final DestinatairePersistence destinatairePersistence, final OrganismePersistence organismePersistence, final ExemplairePersistence exemplairePersistence) {
    return new DestinataireService(destinatairePersistence, organismePersistence, exemplairePersistence);
  }

  @Bean
  public PapaadService papaadService(final PapaadPersistence papaadPersistence, final CommandePersistence commandePersistence) {
    return new PapaadService(papaadPersistence, commandePersistence);
  }
  @Bean  
  public ExemplaireService exemplaireService(
          final ExemplairePersistence exemplairePersistence,
          final ProduiPersistence produiPersistence,
          final RessourcePersistence ressourcePersistence,
          final ParametrePersistence parametrePersistence,
          final FichierService fichierService
  ) {
    return new ExemplaireService(exemplairePersistence, produiPersistence, ressourcePersistence, parametrePersistence, fichierService);
  }

  @Bean
  public ApplicationService applicationService(
          final ApplicationPersistence applicationPersistence, final CommandePersistence commandePersistence) {
    return new ApplicationService(applicationPersistence,commandePersistence);
  }

  @Bean
  public ProductionFluxService productionFluxService(
          final ProductionFluxPersistance productionFluxPersistance) {
    return new ProductionFluxService(productionFluxPersistance);
  }

  @Bean
  public RessourceService ressourceService(final RessourcePersistence ressourcePersistence, final ExemplairePersistence exemplairePersistence) {
    return new RessourceService(ressourcePersistence, exemplairePersistence);
  }

  @Bean
  public FichierService fichierService(
          final FichierPersistence fichierPersistence, final ParametrePersistence parametrePersistence) {
    return new FichierService(fichierPersistence, parametrePersistence);
  }

  @Bean
  public GenEtpService genEtpService(final GenEtpPersistence genEtpPersistence) {
    return new GenEtpService(genEtpPersistence);
  }

  @Bean
  public GenAppService genAppService(final GenAppPersistence genAppPersistence) {
    return new GenAppService(genAppPersistence);
  }

  @Bean
  public OrganismeService organismeService(
          final OrganismePersistence organismePersistence,
          final ApplicationPersistence applicationPersistence,
          final DestinatairePersistence destinatairePersistence
  ) {
    return new OrganismeService(organismePersistence, applicationPersistence, destinatairePersistence);
  }

  @Bean
  public ContenuService contenuService(final ContenuPersistence contenuPersistence) {
     return new ContenuService(contenuPersistence);
  }

  @Bean
  public MassificationService massificationService(
          final MassificationPersistence massificationPersistence,
          final ParametrePersistence parametrePersistence,
          final SiteCNPPersistence siteCNPPersistence
          )
    {
        return new MassificationService(massificationPersistence, parametrePersistence, siteCNPPersistence);
    }

    @Bean
    public RegionMappingService regionMappingService(
            final RegionMappingPersistence regionMappingPersistence
    ){
     return new RegionMappingService(regionMappingPersistence);
    }

  @Bean
  public UtiLogService utiLogService(
          final UtiLogPersistence utiLogPersistence,
          final ParametrePersistence parametrePersistence
  ) {
    return new UtiLogService(utiLogPersistence, parametrePersistence);
  }

  @Bean
  public FacturationDetailleeService facturationDetailleeService(
          final FacturationDetailleePersistence facturationDetailleePersistence,
          final TarposPersistence tarposPersistence
  ) {
    return new FacturationDetailleeService(facturationDetailleePersistence, tarposPersistence);
  }

  @Bean
  public TarposService tarposService(final TarposPersistence tarposPersistence, final TarifPersistence tarifPersistence) {
    return new TarposService(tarposPersistence, tarifPersistence);
  }

  @Bean
  public HelpService helpService(
      final HelpPersistence helpPersistence,
      final AnaisUserProviderPersistence anaisUserProviderPersistence,
      @org.springframework.beans.factory.annotation.Value("${anais.enrich-user-names:true}") final boolean enrichUserNames
  ) {
      return new HelpService(helpPersistence, anaisUserProviderPersistence, enrichUserNames);
  }

  @Bean
  public PathHabiliService pathHabiliService(
    final PathHabiliPersistence pathHabiliPersistence
  ) {
    return new PathHabiliService(pathHabiliPersistence);
  }

  @Bean
  public ServicePosdocService servicePosdocService(
    final ServicePosdocPersistence servicePosdocPersistence
  ) {
    return new ServicePosdocService(servicePosdocPersistence);
  }

  @Bean
  public HistoryService historyService(
    final HistoryPersistence historyPersistence
  ) {
    return new HistoryService(historyPersistence);
  }

  @Bean
  public JobLockService jobLockService(
    final JobLockPersistence jobLockPersistence
  ) {
    return new JobLockService(jobLockPersistence);
  }
}
