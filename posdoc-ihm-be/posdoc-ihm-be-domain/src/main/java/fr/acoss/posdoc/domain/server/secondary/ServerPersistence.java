package fr.acoss.posdoc.domain.server.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.server.model.Server;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ServerPersistence {

    Paginated<Server> select(final QueryParameters queryParameters);

    List<Server> selectAll();

    boolean exists(final String code);

    Server create(Server server);

    Server update(Server server);

    void delete(String code);

    void deleteAll(Iterable<String> ids);

    List<Server> updateAll(List<Server> servers);
}
