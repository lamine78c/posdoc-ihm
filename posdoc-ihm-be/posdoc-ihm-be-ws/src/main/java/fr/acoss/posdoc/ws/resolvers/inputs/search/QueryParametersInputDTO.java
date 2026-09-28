package fr.acoss.posdoc.ws.resolvers.inputs.search;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class QueryParametersInputDTO {

  private FilterCriteriaInputDTO filterCriteria;

  private PaginationParametersInputDTO paginationParameters;

}
