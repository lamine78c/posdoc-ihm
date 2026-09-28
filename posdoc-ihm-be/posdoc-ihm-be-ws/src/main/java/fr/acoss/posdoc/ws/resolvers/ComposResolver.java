package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.compos.secondary.ComposPersistence;
import fr.acoss.posdoc.ws.mappers.ComposMapper;
import fr.acoss.posdoc.ws.resolvers.query.ComposDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ComposResolver extends AbstractQueryResolver {

    private static final ComposMapper MAPPER = ComposMapper.INSTANCE;

    private final ComposPersistence composPersistence;

    public ComposResolver(
            final ComposPersistence composPersistence
    ) {
        this.composPersistence = composPersistence;
    }

    public List<ComposDTO> allComposs() {
        return composPersistence.selectAll().stream().map(MAPPER::domainToDTO).collect(Collectors.toList());
    }

}
