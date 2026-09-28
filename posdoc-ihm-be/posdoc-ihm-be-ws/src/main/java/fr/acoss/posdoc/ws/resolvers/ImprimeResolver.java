package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.fichier.primary.FichierService;
import fr.acoss.posdoc.domain.imprime.primary.ImprimeService;
import fr.acoss.posdoc.domain.imprime.secondary.ImprimePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.FichierMapper;
import fr.acoss.posdoc.ws.mappers.ImprimeMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFichierInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateImprimeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateImprimePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ImprimeResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ImprimeResolver.class);

    private static final ImprimeMapper MAPPER = ImprimeMapper.INSTANCE;
    private static final FichierMapper FICHIER_MAPPER = FichierMapper.INSTANCE;

    private final ImprimePersistence imprimePersistence;

    private final ImprimeService imprimeService;
    private final FichierService fichierService;

    public ImprimeResolver(final ImprimePersistence imprimePersistence,
                           final ImprimeService imprimeService,
                           final FichierService fichierService) {
        this.imprimePersistence = imprimePersistence;
        this.imprimeService = imprimeService;
        this.fichierService = fichierService;
    }

    public PaginatedDTO imprimes(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(
                imprimePersistence.select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)),
                MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateImprimePayloadDTO> allImprimes() {
        return imprimePersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateImprimePayloadDTO> getImprimesByEnvsAndApps(List<String> codesEnv, List<String> codesApp) {
        return imprimePersistence.findImprimesByEnvsAndApps(codesEnv, codesApp).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Fonds de Page > Imprimés", action = Action.CREATE)
    public CreateOrUpdateImprimePayloadDTO createImprime(final CreateOrUpdateImprimeInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createImprime: {}", createDTO);
        }
        return MAPPER.domainToPayloadDTO(imprimeService.createImprime(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Fonds de Page > Imprimés", action = Action.UPDATE)
    public CreateOrUpdateImprimePayloadDTO updateImprime(final CreateOrUpdateImprimeInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateImprime: {}", updateDTO);
        }
        return MAPPER.domainToPayloadDTO(imprimeService.updateImprime(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Fonds de Page > Imprimés", action = Action.DELETE)
    public DeletePayloadDTO deleteImprime(final DeleteByStringIdInputDTO deleteDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteImprime: {}", deleteDTO);
        }
        imprimeService.deleteImprime(deleteDTO.getId());
        return new DeletePayloadDTO(Boolean.TRUE);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Fonds de Page > Imprimés", action = Action.DELETE)
    public DeletePayloadDTO deleteImprimes(final DeleteByArrayStringIdInputDTO deletesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteImprimes: {}", deletesDTO);
        }
        imprimeService.deleteImprimes(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Fonds de Page > Références", action = Action.UPDATE)
    public List<CreateOrUpdateFichierPayloadDTO> updateFichiersFromFondDePage(List<CreateOrUpdateFichierInputDTO> fichiers) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateFichiers: {}", fichiers);
        }
        return FICHIER_MAPPER.domainToPayloadDTO(fichierService.updateAll(FICHIER_MAPPER.inputsDTOToDomains(fichiers)));
    }
}