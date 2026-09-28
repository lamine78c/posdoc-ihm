package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.lotref.secondary.LotRefPersistence;
import fr.acoss.posdoc.ws.mappers.LotRefMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.springframework.stereotype.Component;

@Component
public class LotRefResolver extends AbstractQueryResolver {

  private static final LotRefMapper MAPPER = LotRefMapper.INSTANCE;

  private final LotRefPersistence lotRefPersistence;

  public LotRefResolver(
          LotRefPersistence lotRefPersistence) {this.lotRefPersistence = lotRefPersistence;}

  public PaginatedDTO lotsRef(final QueryParametersInputDTO queryParametersInputDTO) {
    return PA_MAPPER.paginatedToPaginatedDTO(lotRefPersistence
        .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
  }

}
