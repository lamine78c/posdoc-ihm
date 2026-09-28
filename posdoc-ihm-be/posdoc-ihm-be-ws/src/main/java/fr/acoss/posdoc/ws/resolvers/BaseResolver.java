package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.ws.mappers.PaginatedMapper;
import fr.acoss.posdoc.ws.mappers.SearchParametersMapper;

public class BaseResolver {

    protected static final PaginatedMapper PA_MAPPER = PaginatedMapper.INSTANCE;
    protected static final SearchParametersMapper SEARCH_MAPPER = SearchParametersMapper.INSTANCE;

    protected BaseResolver() {
    }

}
