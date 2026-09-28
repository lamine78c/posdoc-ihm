package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.utilog.model.FindUtiLogByQuery;
import fr.acoss.posdoc.domain.utilog.secondary.UtiLogPersistence;
import fr.acoss.posdoc.ws.mappers.UtilogMapper;
import fr.acoss.posdoc.ws.resolvers.payloads.SearchUtilogPayloadDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UtilogResolver extends AbstractQueryResolver {

    private static final UtilogMapper MAPPER = UtilogMapper.INSTANCE;

    private final UtiLogPersistence utiLogPersistence;

    public UtilogResolver(final UtiLogPersistence utiLogPersistence) {
        this.utiLogPersistence = utiLogPersistence;
    }

    public List<SearchUtilogPayloadDTO> findUtiLogByQuery(final FindUtiLogByQuery query) {
        return utiLogPersistence.findUtiLogByQuery(query).stream().map(MAPPER::domainToSearchUtilogPayloadDTO).collect(Collectors.toList());
    }

    public List<String> findDistinctUserUtilog() {
        return utiLogPersistence.findDistinctUser();
    }

    public List<String> findDistinctActionUtilog() {
        return utiLogPersistence.findDistinctAction();
    }

    public List<String> findDistinctFormIdUtilog() {
        return utiLogPersistence.findDistinctFormId();
    }
}