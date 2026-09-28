package fr.acoss.posdoc.domain.common.search;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class QueryParameters {

  private FilterCriteria filterCriteria;

  private PaginationParameters paginationParameters;

}
