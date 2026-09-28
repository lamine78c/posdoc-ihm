package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.environnement.model.CodeEnvDTO;
import fr.acoss.posdoc.domain.environnement.primary.EnvironnementService;
import fr.acoss.posdoc.domain.environnement.secondary.EnvironnementPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.EnvironnementMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateEnvironnementInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateEnvironnementPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EnvironnementResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(EnvironnementResolver.class);

    private static final EnvironnementMapper MAPPER = EnvironnementMapper.INSTANCE;

    private final EnvironnementPersistence environnementPersistence;

    private final EnvironnementService environnementService;

    public EnvironnementResolver(final EnvironnementPersistence environnementPersistence,
                                 final EnvironnementService environnementService) {
        this.environnementPersistence = environnementPersistence;
        this.environnementService = environnementService;
    }

    public PaginatedDTO environnements(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(environnementPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateEnvironnementPayloadDTO> allEnvironnements() {
        return environnementPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateEnvironnementPayloadDTO> allEnvironnementsInApplication() {
        return environnementPersistence.selectAllInApplication().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateEnvironnementPayloadDTO> allEnvironnementsInFichier() {
        return environnementPersistence.selectAllInFichier().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Environnements", action = Action.CREATE)
    public CreateOrUpdateEnvironnementPayloadDTO createEnvironnement(
            final CreateOrUpdateEnvironnementInputDTO environnementInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createEnvironnement: {}", environnementInputDTO);
        }
        return MAPPER.domainToPayloadDTO(environnementService
                .createEnvironnement(MAPPER.inputDTOToDomain(environnementInputDTO)));
    }

    @Historisable(form = "Administration > Environnements", action = Action.UPDATE)
    public CreateOrUpdateEnvironnementPayloadDTO updateEnvironnement(
            final CreateOrUpdateEnvironnementInputDTO environnementInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateEnvironnement: {}", environnementInputDTO);
        }
        return MAPPER.domainToPayloadDTO(environnementService
                .updateEnvironnement(MAPPER.inputDTOToDomain(environnementInputDTO)));
    }

    @Historisable(form = "Administration > Environnements", action = Action.DELETE)
    public DeletePayloadDTO deleteEnvironnement(final DeleteByStringIdInputDTO environnementDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteEnvironnement: {}", environnementDTO);
        }
        this.environnementService.deleteEnvironnement(environnementDTO.getId());

        final var deletePayload = new DeletePayloadDTO();
        deletePayload.setOk(true);

        return deletePayload;
    }

    @Historisable(form = "Administration > Environnements", action = Action.DELETE)
    public DeletePayloadDTO deleteEnvironnements(final DeleteByArrayStringIdInputDTO environnementsDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteEnvironnements: {}", environnementsDTO);
        }
        this.environnementService.deleteEnvironnements(environnementsDTO.getIds());

        return new DeletePayloadDTO(Boolean.TRUE);
    }

    public List<CodeEnvDTO> findCodeEnv() {
        return environnementPersistence.findCodeEnv().stream()
                .map(CodeEnvDTO::new)
                .collect(Collectors.toList());
    }
}
