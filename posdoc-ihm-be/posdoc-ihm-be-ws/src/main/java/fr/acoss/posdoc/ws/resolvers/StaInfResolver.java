package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.stainf.secondary.StaInfPersistence;
import fr.acoss.posdoc.ws.mappers.StaInfMapper;
import fr.acoss.posdoc.ws.resolvers.query.StaInfDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StaInfResolver extends AbstractQueryResolver {

    private static final StaInfMapper MAPPER = StaInfMapper.INSTANCE;

    final StaInfPersistence staInfPersistence;

    public StaInfResolver(final StaInfPersistence staInfPersistence) {
        this.staInfPersistence = staInfPersistence;
    }

    public List<StaInfDTO> allStaInf() {
        return staInfPersistence.selectAll().stream().map(MAPPER::domainToDTO).collect(Collectors.toList());
    }

}
