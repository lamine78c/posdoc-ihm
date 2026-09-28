package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.server.primary.ServerService;
import fr.acoss.posdoc.domain.server.secondary.ServerPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.PaginatedMapper;
import fr.acoss.posdoc.ws.mappers.SearchParametersMapper;
import fr.acoss.posdoc.ws.mappers.ServerMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateServerInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.FilterCriteriaInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.UpdateServersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateServerPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import graphql.kickstart.tools.GraphQLMutationResolver;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ServerResolver implements GraphQLMutationResolver, GraphQLQueryResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ServerResolver.class);

    private static final ServerMapper MAPPER = ServerMapper.INSTANCE;

    private static final PaginatedMapper PA_MAPPER = PaginatedMapper.INSTANCE;

    private static final SearchParametersMapper SEARCH_MAPPER = SearchParametersMapper.INSTANCE;

    private final ServerPersistence serverPersistence;

    private final ServerService serverService;

    public ServerResolver(final ServerPersistence serverPersistence,
                          final ServerService serverService) {
        this.serverPersistence = serverPersistence;
        this.serverService = serverService;
    }

    public PaginatedDTO servers(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(
                serverPersistence.select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)),
                MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateServerPayloadDTO> allServers() {
        return serverPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Fabrication > Serveurs", action = Action.CREATE)
    public CreateOrUpdateServerPayloadDTO createServer(final CreateOrUpdateServerInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createServer: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(serverService
                .createServer(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Serveurs", action = Action.UPDATE)
    public CreateOrUpdateServerPayloadDTO updateServer(final CreateOrUpdateServerInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateServer: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(serverService
                .updateServer(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Serveurs", action = Action.DELETE)
    public DeletePayloadDTO deleteServer(final DeleteByStringIdInputDTO deleteDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteServer: {}", deleteDTO);
        }
        serverService.deleteServers(deleteDTO.getId());
        return new DeletePayloadDTO(true);
    }

    @Historisable(form = "Administration > Fabrication > Serveurs", action = Action.DELETE)
    public DeletePayloadDTO deleteServers(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteServers: {}", deletesDTO);
        }
        serverService.deleteServers(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

}
