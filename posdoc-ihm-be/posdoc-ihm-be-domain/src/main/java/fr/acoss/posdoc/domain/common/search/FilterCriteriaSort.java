package fr.acoss.posdoc.domain.common.search;

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
public class FilterCriteriaSort {

    private FilterCriteria filterCriteria;

    private SortList sortList;

}
