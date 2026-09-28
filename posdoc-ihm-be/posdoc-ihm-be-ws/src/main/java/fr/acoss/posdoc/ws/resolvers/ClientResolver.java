package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.database.dao.HistoryRepository;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.domain.client.primary.ClientService;
import fr.acoss.posdoc.domain.client.secondary.ClientPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ClientMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateClientInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateClientPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ClientResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClientResolver.class);

    private static final ClientMapper MAPPER = ClientMapper.INSTANCE;

    private final ClientService clientService;

    private final ClientPersistence clientPersistence;

    @Autowired
    HistoryRepository rep;

    public ClientResolver(final ClientService clientService,
                          final ClientPersistence clientPersistence) {
        this.clientService = clientService;
        this.clientPersistence = clientPersistence;
    }

    public PaginatedDTO clients(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(clientPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateClientPayloadDTO> allClients() {
        return clientPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Clients", action = Action.CREATE)
    public CreateOrUpdateClientPayloadDTO createClient(final CreateOrUpdateClientInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createClient: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(clientService
                .createClient(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Clients", action = Action.UPDATE)
    public CreateOrUpdateClientPayloadDTO updateClient(final CreateOrUpdateClientInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateClient: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(clientService
                .updateClient(MAPPER.inputDTOToDomain(updateDTO)));

    }

    @Historisable(form = "Administration > Clients", action = Action.DELETE)
    public DeletePayloadDTO deleteClients(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteClients: {}", deletesDTO);
        }
        clientService.deleteClients(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

}
