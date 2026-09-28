package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.colimp.secondary.ColimpPersistence;
import fr.acoss.posdoc.ws.mappers.ColimpMapper;
import fr.acoss.posdoc.ws.resolvers.query.ColimpDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ColimpResolver extends AbstractQueryResolver {

    private static final ColimpMapper MAPPER = ColimpMapper.INSTANCE;

    private final ColimpPersistence colimpPersistence;

    public ColimpResolver(
            final ColimpPersistence colimpPersistence
    ) {
        this.colimpPersistence = colimpPersistence;
    }

    public List<ColimpDTO> allColimps() {
        return colimpPersistence.selectAll().stream().map(MAPPER::domainToDTO).collect(Collectors.toList());
    }

}
