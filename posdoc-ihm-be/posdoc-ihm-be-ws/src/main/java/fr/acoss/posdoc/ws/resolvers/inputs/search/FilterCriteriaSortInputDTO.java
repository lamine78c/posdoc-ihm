package fr.acoss.posdoc.ws.resolvers.inputs.search;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FilterCriteriaSortInputDTO {

    private FilterCriteriaInputDTO filterCriteria;

    private SortListInputDTO sortList;

}
