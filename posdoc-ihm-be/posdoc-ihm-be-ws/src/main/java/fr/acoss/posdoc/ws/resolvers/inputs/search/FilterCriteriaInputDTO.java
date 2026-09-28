package fr.acoss.posdoc.ws.resolvers.inputs.search;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FilterCriteriaInputDTO {

  private List<FilterCriterionInputDTO> criteria;

}
