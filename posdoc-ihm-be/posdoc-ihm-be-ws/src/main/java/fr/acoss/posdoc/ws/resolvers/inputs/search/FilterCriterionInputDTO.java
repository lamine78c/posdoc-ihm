package fr.acoss.posdoc.ws.resolvers.inputs.search;

import fr.acoss.posdoc.types.SearchOperation;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FilterCriterionInputDTO {

  private String column;

  private String value;

  private SearchOperation operation;

}
