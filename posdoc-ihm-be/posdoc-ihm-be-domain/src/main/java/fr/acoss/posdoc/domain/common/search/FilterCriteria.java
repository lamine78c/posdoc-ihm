package fr.acoss.posdoc.domain.common.search;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FilterCriteria implements Serializable {
    private static final long serialVersionUID = 1L;

    private List<FilterCriterion> criteria;

}
