package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.history.model.FindHistoryByQuery;
import fr.acoss.posdoc.domain.history.secondary.HistoryPersistence;
import fr.acoss.posdoc.ws.mappers.HistoryMapper;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateHistoryPayloadDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class HistoryResolver extends AbstractQueryResolver {

    private static final HistoryMapper MAPPER = HistoryMapper.INSTANCE;

    private final HistoryPersistence historyPersistence;

    public HistoryResolver(final HistoryPersistence historyPersistence) {
        this.historyPersistence = historyPersistence;
    }

    public List<CreateOrUpdateHistoryPayloadDTO> allHistory() {
        return historyPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateHistoryPayloadDTO> findHistoryByQuery(FindHistoryByQuery query) {
        return historyPersistence.findHistoryByQuery(query).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<String> findDistinctUser() {
        return historyPersistence.findDistinctUser();
    }

    public List<String> findDistinctEntity() {
        return historyPersistence.findDistinctEntity();
    }

    public List<CreateOrUpdateHistoryPayloadDTO> findHistoryByCodulo(Integer codulo) {
        return historyPersistence.findHistoryByCodulo(codulo).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }
}