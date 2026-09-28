package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.composition.primary.CompositionService;
import fr.acoss.posdoc.domain.composition.secondary.CompositionPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.CompositionMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateCompositionInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateCompositionPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CompositionResolver extends AbstractResolver {

    private static final CompositionMapper MAPPER = CompositionMapper.INSTANCE;

    private static final Logger LOGGER = LoggerFactory.getLogger(CompositionResolver.class);

    private final CompositionPersistence compositionPersistence;
    private final CompositionService compositionService;

    public CompositionResolver(
            CompositionPersistence compositionPersistence,
            CompositionService compositionService
    ) {
        this.compositionPersistence = compositionPersistence;
        this.compositionService = compositionService;
    }

    public PaginatedDTO compositions(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(compositionPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateCompositionPayloadDTO> allCompositions() {
        return compositionPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Spécification de fichiers > Compositions", action = Action.CREATE)
    public CreateOrUpdateCompositionPayloadDTO createComposition(
            final CreateOrUpdateCompositionInputDTO compositionInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createComposition: {}", compositionInputDTO);
        }
        return MAPPER.domainToPayloadDTO(compositionService
                .createComposition(MAPPER.inputDTOToDomain(compositionInputDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Compositions", action = Action.UPDATE)
    public CreateOrUpdateCompositionPayloadDTO updateComposition(
            final CreateOrUpdateCompositionInputDTO compositionInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateComposition: {}", compositionInputDTO);
        }
        return MAPPER.domainToPayloadDTO(compositionService
                .updateComposition(MAPPER.inputDTOToDomain(compositionInputDTO)));
    }


    @Historisable(form = "Administration > Spécification de fichiers > Compositions", action = Action.DELETE)
    public DeletePayloadDTO deleteCompositions(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteCompositions: {}", deletesDTO);
        }
        compositionService.deleteCompositions(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

}
