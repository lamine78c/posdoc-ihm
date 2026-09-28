package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.fichier.model.CodComCodDocLibFicInFichier;
import fr.acoss.posdoc.domain.fichier.model.CodficRefimpCodprdDTO;
import fr.acoss.posdoc.domain.fichier.model.FichierComposite;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvOrgsAppComFicQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvOrgsAppComQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchFichierFilterQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchOrgByEnvAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.primary.FichierService;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.FichierMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFichierInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.ComFichProdEnGroupInFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateFichierWithExemplairePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.EnvAppRefImpEnGroupInFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.EnvDocImpEnGroupInFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_DOCAPP;
import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_DOCORG;

@Component
public class FichierResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(FichierResolver.class);

    private static final FichierMapper MAPPER = FichierMapper.INSTANCE;

    private final FichierPersistence fichierPersistence;
    private final FichierService fichierService;
    private final ParametrePersistence parametrePersistence;

    public FichierResolver(FichierPersistence fichierPersistence, FichierService fichierService, ParametrePersistence parametrePersistence) {
        this.fichierPersistence = fichierPersistence;
        this.fichierService = fichierService;
        this.parametrePersistence = parametrePersistence;
    }

    public PaginatedDTO fichiers(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(fichierPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateFichierPayloadDTO> allFichiers() {

        return fichierPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateFichierPayloadDTO> getFichiersByApp(
            String codenv, List<String> codesOrg, List<String> codesApp, List<String> codesCom) {
        return fichierPersistence.findFichiersByApp(codenv, codesOrg, codesApp, codesCom)
                .stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Propriétés des fichiers", action = Action.CREATE)
    public CreateFichierWithExemplairePayloadDTO createFichierWithExemplaire(
            final List<CreateOrUpdateFichierInputDTO> createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createFichierWithExemplaire: {}", createDTO);
        }

        var result = fichierService.createFichiersWithExemplaire(MAPPER.inputsDTOToDomains(createDTO));

        var createFichierWithExemplairePayloadDTO = new CreateFichierWithExemplairePayloadDTO();
        createFichierWithExemplairePayloadDTO.setNbFichiers(result.get("nbFichiers"));
        createFichierWithExemplairePayloadDTO.setNbProduits(result.get("nbProduits"));
        createFichierWithExemplairePayloadDTO.setNbExemplaires(result.get("nbExemplaires"));

        return createFichierWithExemplairePayloadDTO;
    }

    public List<CreateOrUpdateFichierPayloadDTO> getFichiersForUpdatingReference(
            List<String> codesEnv, List<String> codesApp, List<String> refsImp) {
        return this.fichierPersistence.getFichiersForUpdatingReference(codesEnv, codesApp, refsImp)
                .stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<String> getFichiersToAddNewExemplaire(String codeEnv, String codeOrg, String codeApp, String perCod, String codeGam) {
        return this.fichierPersistence.getFichiersToAddNewExemplaire(codeEnv, codeOrg, codeApp, perCod, codeGam);
    }

    public List<CreateOrUpdateFichierPayloadDTO> setNewImprimeToFichiers(List<CreateOrUpdateFichierInputDTO> fichiers) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Fichiers: {}", fichiers);
        }
        return MAPPER.domainToPayloadDTO(this.fichierService
                .setNewImprimeToFichiers(MAPPER.inputsDTOToDomains(fichiers)));
    }

    public CreateOrUpdateFichierPayloadDTO setNewImprimeToFichier(CreateOrUpdateFichierInputDTO fichier) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Fichier: {}", fichier);
        }
        return MAPPER.domainToPayloadDTO(this.fichierService
                .setNewImprimeToFichier(MAPPER.inputDTOToDomain(fichier)));
    }

    public List<CreateOrUpdateFichierPayloadDTO> getFichiersForAdsNull(
            String codeEnv, String codeOrg, String codeApp, String codeCom, String codeFic, String refImprime) {
        return fichierPersistence.findFichiersForAdsNull(codeEnv, codeOrg, codeApp, codeCom, codeFic, refImprime)
                .stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateFichierPayloadDTO> getExistedFichiers(
            List<String> codeEnv, String codeApp, String codeCom, String codeFic) {
        return fichierPersistence.getExistedFichiers(codeEnv, codeApp, codeCom, codeFic)
                .stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Propriétés des fichiers", action = Action.DELETE)
    public DeletePayloadDTO deleteFichiers(final List<CreateOrUpdateFichierInputDTO> deleteDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteFichiers: {}", deleteDTO);
        }
        this.fichierService.deleteFichiers(MAPPER.inputsDTOToDomains(deleteDTO));
        return new DeletePayloadDTO(true);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Propriétés des fichiers", action = Action.UPDATE)
    public List<CreateOrUpdateFichierPayloadDTO> updateFichiers(List<CreateOrUpdateFichierInputDTO> fichiers) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateFichiers: {}", fichiers);
        }
        return MAPPER.domainToPayloadDTO(fichierService.updateAll(MAPPER.inputsDTOToDomains(fichiers)));
    }

    public List<EnvAppRefImpEnGroupInFichierPayloadDTO> getFichiersSearchElements() {
        return MAPPER.domainSearchToPayloadDTO(fichierPersistence.findEnvAppRefImpEnGroup());
    }

    public List<String> getDistinctEnvsFromFichier() {
        return fichierPersistence.findDistinctEnvironnements();
    }

    List<String> getDistOrgByEnvFromFichier(SearchFichierFilterQuery query) {
        return fichierPersistence.findDistOrgByEnv(query);
    }

    List<String> getDistAppByEnvOrgFromFichier(SearchFichierFilterQuery query) {
        return fichierPersistence.findDistAppByEnvOrg(query);
    }

    List<String> getDistComByEnvOrgAppFromFichier(SearchFichierFilterQuery query) {
        return fichierPersistence.findDistComByEnvOrgApp(query);
    }

    List<String> getDistFicByEnvOrgAppCom(SearchFichierFilterQuery query) {
        return fichierPersistence.findDistFicByEnvOrgAppCom(query);
    }

    List<CreateOrUpdateFichierPayloadDTO> getPreselectedFichier(SearchFichierFilterQuery query) {
        return fichierPersistence.findPreselectedFichier(query).stream()
                .map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<ComFichProdEnGroupInFichierPayloadDTO> getAllDistinctCodComCodFicCodPrd() {
        return MAPPER.domainProdToPayloadDTO(fichierPersistence.getAllDistinctCodComCodFicCodPrd());
    }

    public List<EnvDocImpEnGroupInFichierPayloadDTO> getFichiersSearchByEnvironnement( ) {

        String codeOrg=this.parametrePersistence.getValueByCode(PARAM_CODE_DOCORG);
        String codeApp=parametrePersistence.getValueByCode(PARAM_CODE_DOCAPP);

        return MAPPER.domainSearchByPramsToPayloadDTO(fichierPersistence.findFichiersByAppAndOrg(codeOrg,codeApp));
    }

    public List<String> getOrgByEnvAppComFics(SearchOrgByEnvAppComFicsQuery query) {
        return fichierService.getOrgByEnvAppComFics(query);
    }

    public List<NotficFichier> findFichiersForAffectationNotice(SearchNotficQuery query) {
        return fichierPersistence.findFichiersForAffectationNotice(query);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition par ressource", action = Action.UPDATE)
    public Boolean updateFicAttByEnvOrgsAppComFic(final SearchByEnvOrgsAppComFicQuery query, final String message) {
        fichierPersistence.updateFicAttByEnvOrgsAppComFic(query, message);
        return true;
    }

    List<String> getDistOrgNoMasByEnvFromFichier(SearchFichierFilterQuery query) {
        return fichierPersistence.findDistOrgNoMasByEnv(query);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Distribution > Paramètres Edition en liste", action = Action.UPDATE)
    public Boolean updateFicAttByIds(List<FichierComposite> ids, String message) {
        fichierPersistence.updateFicAttByIds(ids, message);
        return true;
    }

    public  List<CodComCodDocLibFicInFichier> findComDocLibFicInFichier() {
        return fichierPersistence.findComDocLibFicInFichier();
    }

    public List<CodficRefimpCodprdDTO> findFicPrdImpByEnvOrgAppCom(SearchByEnvOrgsAppComQuery query) {
        return fichierPersistence.findFicPrdImpByEnvOrgAppCom(query);
    }
}
