package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.statut.model.StatutDTO;
import fr.acoss.posdoc.domain.statut.secondary.StatutPersistence;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StatutResolver extends AbstractQueryResolver {

    private final StatutPersistence statutPersistence;

    public StatutResolver(final StatutPersistence statutPersistence) {
        this.statutPersistence = statutPersistence;
    }

    public List<StatutDTO> allStatuts() {
        return statutPersistence.findAllStatutOrderByCodeAsc().stream()
                .map(statut -> new StatutDTO(statut.getCode(), statut.getLibelle()))
                .collect(Collectors.toList());
    }
}