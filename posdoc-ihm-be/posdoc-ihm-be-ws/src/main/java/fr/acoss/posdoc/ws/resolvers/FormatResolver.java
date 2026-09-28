package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.format.primary.FormatService;
import fr.acoss.posdoc.domain.format.secondary.FormatPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.FormatMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFormatInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateFormatPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FormatResolver extends AbstractResolver {

    private static final FormatMapper MAPPER = FormatMapper.INSTANCE;
    private static final Logger LOGGER = LoggerFactory.getLogger(FormatResolver.class);
    private final FormatPersistence formatPersistence;
    private final FormatService formatService;

    public FormatResolver(
            FormatPersistence formatPersistence,
            FormatService formatService) {
        this.formatPersistence = formatPersistence;
        this.formatService = formatService;
    }

    public PaginatedDTO formats(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(formatPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateFormatPayloadDTO> allFormats() {
        return formatPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Spécification de fichiers > Formats", action = Action.CREATE)
    public CreateOrUpdateFormatPayloadDTO createFormat(
            final CreateOrUpdateFormatInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createFormat: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(formatService
                .createFormat(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Formats", action = Action.UPDATE)
    public CreateOrUpdateFormatPayloadDTO updateFormat(
            final CreateOrUpdateFormatInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateFormat: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(formatService
                .updateFormat(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Formats", action = Action.DELETE)
    public DeletePayloadDTO deleteFormats(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteFormats: {}", deletesDTO);
        }
        formatService.deleteFormats(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }


}
