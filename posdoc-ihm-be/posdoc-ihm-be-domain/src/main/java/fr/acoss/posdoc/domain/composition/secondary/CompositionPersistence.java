package fr.acoss.posdoc.domain.composition.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.composition.model.Composition;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface CompositionPersistence {

    Paginated<Composition> select(final QueryParameters queryParameters);

    List<Composition> selectAll();

    boolean exists(String code);

    Composition create(Composition composition);

    Composition update(Composition composition);

    void delete(String codes);

    void deleteAll(Iterable<String> ids);
}
