package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.groupe.secondary.GroupePersistence;
import fr.acoss.posdoc.ws.mappers.GroupeMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.springframework.stereotype.Component;

@Component
public class GroupeResolver extends AbstractQueryResolver {

  private static final GroupeMapper MAPPER = GroupeMapper.INSTANCE;

  private final GroupePersistence groupePersistence;

  public GroupeResolver(
          GroupePersistence groupePersistence) {this.groupePersistence = groupePersistence;}

  public PaginatedDTO groupes(final QueryParametersInputDTO queryParametersInputDTO) {
    return PA_MAPPER.paginatedToPaginatedDTO(groupePersistence
        .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
  }

}
