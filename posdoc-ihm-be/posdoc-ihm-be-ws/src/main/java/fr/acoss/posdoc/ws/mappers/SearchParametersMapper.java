package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.common.search.FilterCriteria;
import fr.acoss.posdoc.domain.common.search.FilterCriteriaSort;
import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.ws.resolvers.inputs.search.FilterCriteriaInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.FilterCriteriaSortInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface SearchParametersMapper {

  SearchParametersMapper INSTANCE = Mappers.getMapper(SearchParametersMapper.class);

  QueryParameters inputDTOToDomain(final QueryParametersInputDTO queryParametersInputDTO);

  FilterCriteria inputDTOToDomain(final FilterCriteriaInputDTO filterCriteriaInputDTO);

  FilterCriteriaSort inputDTOToDomain(final FilterCriteriaSortInputDTO filterCriteriaSortInputDTO);


}
