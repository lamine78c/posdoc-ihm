package fr.acoss.posdoc.domain.client.secondary;

import fr.acoss.posdoc.domain.client.model.Client;
import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ClientPersistence {

  Paginated<Client> select(final QueryParameters queryParameters);

  List<Client> selectAll();

  Client create(Client client);

  Client update(Client client);

  void delete(String code);

  void deleteAll(Iterable<String> ids);

  boolean exists(String code);
}
