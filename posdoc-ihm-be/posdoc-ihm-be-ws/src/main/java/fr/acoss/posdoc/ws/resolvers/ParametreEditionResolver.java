package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.parametre.distribution.model.CodeEnvOrgsAppPayload;
import fr.acoss.posdoc.domain.parametre.distribution.model.RessourceCodeEnvOrgsAppDTO;
import fr.acoss.posdoc.domain.parametre.edition.primary.ParametreEditionService;
import fr.acoss.posdoc.domain.parametre.edition.secondary.ParametreEditionPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ParametreEditionMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateParametreEditionInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametreEditionPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ParametreEditionResolver extends AbstractResolver {

    private static final ParametreEditionMapper MAPPER = ParametreEditionMapper.INSTANCE;
    private static final Logger LOGGER = LoggerFactory.getLogger(ParametreEditionResolver.class);

    private final ParametreEditionPersistence parametreEditionPersistence;
    private final ParametreEditionService parametreEditionService;

    public ParametreEditionResolver(
            ParametreEditionPersistence parametreEditionPersistence,
            ParametreEditionService parametreEditionService) {
        this.parametreEditionPersistence = parametreEditionPersistence;
        this.parametreEditionService = parametreEditionService;
    }

    public PaginatedDTO parametresEdition(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(parametreEditionPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateParametreEditionPayloadDTO> allParametresEdition() {
        return parametreEditionPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Spécification de fichiers > Rééditions", action = Action.CREATE)
    public CreateOrUpdateParametreEditionPayloadDTO createParametreEdition(
            final CreateOrUpdateParametreEditionInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createParametreEdition: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(parametreEditionService
                .createParametreEdition(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Rééditions", action = Action.UPDATE)
    public CreateOrUpdateParametreEditionPayloadDTO updateParametreEdition(
            final CreateOrUpdateParametreEditionInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateFarametreEdition: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(parametreEditionService
                .updateParametreEdition(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Rééditions", action = Action.DELETE)
    public DeletePayloadDTO deleteParametresEdition(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteParametresEdition: {}", deletesDTO);
        }
        parametreEditionService.deleteParametresEdition(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

    public List<RessourceCodeEnvOrgsAppDTO> getRessourcesByCodeEnvOrgsApp(CodeEnvOrgsAppPayload codeEnvOrgsAppPayload) {
        return parametreEditionPersistence.getRessourcesByCodeEnvOrgsApp(codeEnvOrgsAppPayload);
    }

    public List<String> getCodeDestinatairesByCodeOrgs(List<String> codorgs) {
        return parametreEditionPersistence.getCodeDestinatairesByCodeOrgs(codorgs);
    }
}
