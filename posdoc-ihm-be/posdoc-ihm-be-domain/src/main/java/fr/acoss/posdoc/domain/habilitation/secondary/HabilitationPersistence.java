package fr.acoss.posdoc.domain.habilitation.secondary;


import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import fr.acoss.posdoc.types.Paginated;


import java.util.List;

public interface HabilitationPersistence {

    Paginated<Habilitation> select(final QueryParameters queryParameters);

    List<Habilitation> selectAll();

    boolean exists(final Integer id);

    Habilitation create(Habilitation habilitation);

    void delete(Integer id);

    void deleteAll(Iterable<String> ids);

    List<Habilitation> updateAll(List<Habilitation> habilitations);
}
