package fr.acoss.posdoc.domain.multif.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.multif.model.Multif;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface MultifPersistence {

    Paginated<Multif> select(final QueryParameters queryParameters);

    List<Multif> selectAll();

    boolean exists(String code);

    Multif create(Multif composition);

    Multif update(Multif composition);

    void deleteAll(Iterable<String> ids);

}
