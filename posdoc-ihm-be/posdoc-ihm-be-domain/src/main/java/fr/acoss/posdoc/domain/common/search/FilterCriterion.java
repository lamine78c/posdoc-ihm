package fr.acoss.posdoc.domain.common.search;

import fr.acoss.posdoc.types.SearchOperation;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FilterCriterion implements Serializable {
  private static final long serialVersionUID = 1L;

  private String column;

  private String value;

  private SearchOperation operation;

}
