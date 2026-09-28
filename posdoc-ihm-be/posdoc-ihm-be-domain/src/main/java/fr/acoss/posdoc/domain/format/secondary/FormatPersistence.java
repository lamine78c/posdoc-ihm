package fr.acoss.posdoc.domain.format.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.format.model.Format;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface FormatPersistence {

    Paginated<Format> select(final QueryParameters queryParameters);

    List<Format> selectAll();

    boolean exists(String code);

    Format create(Format format);

    Format update(Format format);

    void deleteAll(Iterable<String> ids);

    boolean existsByType(String typeFormat);
}
