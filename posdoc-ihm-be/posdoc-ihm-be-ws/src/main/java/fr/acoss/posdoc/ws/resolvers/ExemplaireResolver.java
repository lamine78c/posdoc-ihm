package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByFilterQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByResource;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireComposite;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichier;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichierCodficRefimpCodprdDTO;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireGammeSiteRessourceDTO;
import fr.acoss.posdoc.domain.exemplaire.model.FindExemplaireQuery;
import fr.acoss.posdoc.domain.exemplaire.model.FindOrganismesToCompleteInput;
import fr.acoss.posdoc.domain.exemplaire.model.query.ExemplaireByRessourceQuery;
import fr.acoss.posdoc.domain.exemplaire.primary.ExemplaireService;
import fr.acoss.posdoc.domain.exemplaire.secondary.ExemplairePersistence;
import fr.acoss.posdoc.domain.fichier.model.query.EnvOrgsAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.organisme.model.Organisme;
import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.domain.parametre.distribution.model.RessourcePayload;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ExemplaireMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateExemplaireInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateExemplairesInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayExemplaireCompositeIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteExemplaireInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.FilterCriteriaSortInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.ExemplaireRegionPayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ExemplaireResolver extends AbstractResolver {

  private static final Logger LOGGER = LoggerFactory.getLogger(ExemplaireResolver.class);

  private static final ExemplaireMapper MAPPER = ExemplaireMapper.INSTANCE;

  private final ExemplaireService exemplaireService;

  private final ExemplairePersistence exemplairePersistence;
  private final OrganismePersistence organismePersistence;
  private final ParametrePersistence parametrePersistence;
  private final FichierPersistence fichierPersistence;

  public ExemplaireResolver(ExemplaireService exemplaireService, ExemplairePersistence exemplairePersistence,
                            OrganismePersistence organismePersistence, ParametrePersistence parametrePersistence,
                            FichierPersistence fichierPersistence) {
    this.exemplairePersistence = exemplairePersistence;
    this.exemplaireService = exemplaireService;
    this.organismePersistence = organismePersistence;
    this.parametrePersistence = parametrePersistence;
    this.fichierPersistence = fichierPersistence;
  }

  public List<String> getDistinctEnvsFromExemplaire() {
    return exemplairePersistence.findDistinctEnvironnements();
  }

  List<String> getDistOrgByEnvFromExemplaire(List<String> envs){
    return exemplairePersistence.findDistOrgByEnv(envs);
  }

  List<String> getDistAppByEnvOrgFromExemplaire(List<String> envs, List<String> orgs){
    return exemplairePersistence.findDistAppByEnvOrg(envs, orgs);
  }

  List<String> getDistComByEnvOrgAppFromExemplaire(List<String> envs, List<String> orgs, String app){
    return exemplairePersistence.findDistComByEnvOrgApp(envs, orgs, app);
  }

  List<ExemplaireFichierCodficRefimpCodprdDTO> getDistFicByEnvOrgAppComFromExemplaire(ExemplaireByFilterQuery query){
    return exemplairePersistence.findDistFicByEnvOrgAppCom(query);
  }

  List<ExemplaireGammeSiteRessourceDTO> getDistRessourceByEnvOrgAppComFicFromExemplaire(ExemplaireByFilterQuery query) {
    return exemplairePersistence.findDistRessourceByEnvOrgAppComFic(query);
  }

  List<ExemplaireFichier> getPreselectedExemplaire(ExemplaireByFilterQuery query){
    String genericOrganisme = parametrePersistence.getValueByCode(ParamsUtils.OGUORG);

    return exemplairePersistence.findPreselectedExemplaire(query, genericOrganisme);
  }

  public List<Exemplaire> allExemplaires() {
    return exemplairePersistence.selectAll();
  }
  public List<Exemplaire> getExemplaires(final FilterCriteriaSortInputDTO filterCriteriaSortInputDTO) {
    return exemplairePersistence.selectAll(SEARCH_MAPPER.inputDTOToDomain(filterCriteriaSortInputDTO));
  }

  public List<ExemplaireRegionPayloadDTO> findExemplaires(FindExemplaireQuery findExemplaireQuery) {

    List<Organisme> organismes = organismePersistence.findAllOrganismes();
    List<Exemplaire> exemplaires =  exemplairePersistence.findExemplaires(findExemplaireQuery);

    List<ExemplaireRegionPayloadDTO> exemplaireRegions = new ArrayList<>();
    for (Exemplaire exemplaire : exemplaires) {
      ExemplaireRegionPayloadDTO  exemplaireRegionPayloadDTO = new ExemplaireRegionPayloadDTO();

       exemplaireRegionPayloadDTO.setCodapp(exemplaire.getCodapp());
       exemplaireRegionPayloadDTO.setCodorg(exemplaire.getCodorg());
       exemplaireRegionPayloadDTO.setCodcom(exemplaire.getCodcom());
       exemplaireRegionPayloadDTO.setCodfic(exemplaire.getCodfic());
       exemplaireRegionPayloadDTO.setCodenv(exemplaire.getCodenv());
       exemplaireRegionPayloadDTO.setCoddes(exemplaire.getCoddes());
       exemplaireRegionPayloadDTO.setCodgam(exemplaire.getCodgam());
       exemplaireRegionPayloadDTO.setCodsit(exemplaire.getCodsit());
       exemplaireRegionPayloadDTO.setCodres(exemplaire.getCodres());
       exemplaireRegionPayloadDTO.setNbrexe(exemplaire.getNbrexe());
       exemplaireRegionPayloadDTO.setNumexe(exemplaire.getNumexe());
       exemplaireRegionPayloadDTO.setExeact(exemplaire.getExeact());

      for (Organisme organisme : organismes) {
        if (exemplaire.getCodorg().equals(organisme.getCode()) && organisme.getCodeRegion() != null) {
          exemplaireRegionPayloadDTO.setCodreg(organisme.getCodeRegion());
        }
      }
      exemplaireRegions.add(exemplaireRegionPayloadDTO);
    }
    return exemplaireRegions;
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition par ressource", action = Action.CREATE)
  public Exemplaire createExemplaire(final CreateOrUpdateExemplaireInputDTO createDTO) {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("createExemplaire: {}", createDTO);
    }

    return exemplaireService.createExemplaire(MAPPER.inputDTOToDomain(createDTO));
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition par ressource", action = Action.UPDATE)
  public Exemplaire updateExemplaire(final CreateOrUpdateExemplaireInputDTO updateDTO) {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("updateExemplaire: {}", updateDTO);
    }

    return exemplaireService.updateExemplaire(MAPPER.inputDTOToDomain(updateDTO));
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition En Liste", action = Action.CREATE)
  @Transactional
  public List<Exemplaire> createExemplaires(final CreateOrUpdateExemplairesInputDTO createsDTO, final String message) {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("createExemplaires: {}", createsDTO);
    }
    var exemplaires = createsDTO.getExemplaires().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
    List<Exemplaire> result = exemplaireService.createExemplaires(exemplaires);
    if ( message != null && !message.isEmpty() && !result.isEmpty()) {
      EnvOrgsAppComFicsQuery query = new EnvOrgsAppComFicsQuery();
      CreateOrUpdateExemplaireInputDTO exemplaire = createsDTO.getExemplaires().get(0);
      query.setCodenv(exemplaire.getCodenv());
      query.setCodorgs(createsDTO.getExemplaires().stream().map(CreateOrUpdateExemplaireInputDTO::getCodorg).collect(Collectors.toList()));
      query.setCodapp(exemplaire.getCodapp());
      query.setCodcom(exemplaire.getCodcom());
      query.setCodfics(createsDTO.getExemplaires().stream().map(CreateOrUpdateExemplaireInputDTO::getCodfic).collect(Collectors.toList()));
      fichierPersistence.updateFicAttByEnvOrgsAppComFics(query, message);
    }
    return result;
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition En Liste", action = Action.UPDATE)
  @Transactional
  public List<Exemplaire> updateExemplaires(final CreateOrUpdateExemplairesInputDTO updatesDTO) {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("updateExemplaires: {}", updatesDTO);
    }

    var exemplaires = updatesDTO.getExemplaires().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
    return exemplaireService.updateExemplaires(exemplaires);
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition par ressource", action = Action.DELETE)
  public DeletePayloadDTO deleteExemplaire(final DeleteExemplaireInputDTO exemplaire) {

    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("deleteExemplaire: {}", exemplaire);
    }

    ExemplaireComposite id = new ExemplaireComposite(exemplaire.getCodenv(), exemplaire.getCodorg(), exemplaire.getCodapp(), exemplaire.getCodcom(), exemplaire.getCodfic(), exemplaire.getCodgam(), exemplaire.getNumexe());
    exemplaireService.deleteExemplaire(id, exemplaire.getCodres(), exemplaire.getCodsit());

    return new DeletePayloadDTO(true);
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition En Liste", action = Action.DELETE)
  @Transactional
  public DeletePayloadDTO deleteExemplaires(final DeleteByArrayExemplaireCompositeIdInputDTO deleteDTO) {

    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("deleteExemplaires: {}", deleteDTO);
    }

    List<Exemplaire> deletes = new ArrayList<>();

    deleteDTO.getIds().forEach(e-> deletes.add(new Exemplaire(
            e.getCodenv(),
            e.getCodorg(),
            e.getCodapp(),
            e.getCodcom(),
            e.getCodfic(),
            e.getCodgam(),
            e.getNumexe(),
            e.getCodsit(),
            e.getCodres(),
            null, null, null
    )));

    exemplaireService.deleteExemplaires(deletes);

    return new DeletePayloadDTO(true);
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition En Liste", action = Action.UPDATE)
  @Transactional
  public List<Exemplaire> updateMasseExemplaires(final RessourcePayload ressourcePayload, final List<Exemplaire> exemplaires) {
    return exemplaireService.updateMasseExemplaires(ressourcePayload, exemplaires);
  }

  public List<ExemplaireByResource> getExemplairesByRessource(ExemplaireByRessourceQuery query) {
    String genericOrganisme = parametrePersistence.getValueByCode(ParamsUtils.OGUORG);
    return exemplaireService.getParametresEditionByRessource(query, genericOrganisme);
  }

  public List<String> findExemplaireOrganismeToComplete(FindOrganismesToCompleteInput input) {
    return exemplaireService.findExemplaireOrganismeToComplete(input);
  }
}
