package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.multif.primary.MultifService;
import fr.acoss.posdoc.domain.multif.secondary.MultifPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.MultifMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateMultifInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateMultifPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MultifResolver extends AbstractResolver {

    private static final MultifMapper MAPPER = MultifMapper.INSTANCE;
    private static final Logger LOGGER = LoggerFactory.getLogger(MultifResolver.class);
    private final MultifPersistence multifPersistence;
    private final MultifService multifService;

    public MultifResolver(
            MultifPersistence multifPersistence,
            MultifService multifService) {
        this.multifPersistence = multifPersistence;
        this.multifService = multifService;
    }

    public PaginatedDTO multifs(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(multifPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateMultifPayloadDTO> allMultifs() {
        return multifPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Spécification de fichiers > Multi feuillets", action = Action.CREATE)
    public CreateOrUpdateMultifPayloadDTO createMultif(
            final CreateOrUpdateMultifInputDTO multifInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createMultif: {}", multifInputDTO);
        }
        return MAPPER.domainToPayloadDTO(multifService
                .createMultif(MAPPER.inputDTOToDomain(multifInputDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Multi feuillets", action = Action.UPDATE)
    public CreateOrUpdateMultifPayloadDTO updateMultif(
            final CreateOrUpdateMultifInputDTO multifInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateMultif: {}", multifInputDTO);
        }
        return MAPPER.domainToPayloadDTO(multifService
                .updateMultif(MAPPER.inputDTOToDomain(multifInputDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Multi feuillets", action = Action.DELETE)
    public DeletePayloadDTO deleteMultifs(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteMultifs: {}", deletesDTO);
        }
        multifService.deleteMultifs(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

}
