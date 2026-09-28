package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.habilitation.primary.HabilitationService;
import fr.acoss.posdoc.domain.habilitation.secondary.HabilitationPersistence;
import fr.acoss.posdoc.ws.mappers.HabilitationMapper;
import fr.acoss.posdoc.ws.mappers.PaginatedMapper;
import fr.acoss.posdoc.ws.mappers.SearchParametersMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.*;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateHabilitationPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class HabilitationResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(HabilitationResolver.class);

    private static final HabilitationMapper MAPPER = HabilitationMapper.INSTANCE;

    private static final PaginatedMapper PA_MAPPER = PaginatedMapper.INSTANCE;

    private static final SearchParametersMapper SEARCH_MAPPER = SearchParametersMapper.INSTANCE;

    private final HabilitationPersistence habilitationPersistence;

    private final HabilitationService habilitationService;

    public HabilitationResolver(final HabilitationPersistence habilitationPersistance,
                                final HabilitationService habilitationService) {
        this.habilitationPersistence = habilitationPersistance;
        this.habilitationService = habilitationService;
    }

    public PaginatedDTO habilitations(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(
                habilitationPersistence.select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)),
                MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateHabilitationPayloadDTO> allHabilitations() {
        return habilitationPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public DeletePayloadDTO deleteHabilitations(final DeleteByArrayStringIdInputDTO deletesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteHabilitations: {}", deletesDTO);
        }
        habilitationService.deleteHabilitations(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

    public List<CreateOrUpdateHabilitationPayloadDTO> updateHabilitations(final UpdateHabilitationsInputDTO updatesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updatesHabilitations: {}", updatesDTO);
        }
        var habilitations = updatesDTO.getHabilitations().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
        return habilitationService.updateHabilitations(habilitations).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateHabilitationPayloadDTO> createHabilitations(final UpdateHabilitationsInputDTO updatesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createServers: {}", updatesDTO);
        }
        var servers = updatesDTO.getHabilitations().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
        return habilitationService.createHabilitations(servers).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }
}
