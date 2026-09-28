package fr.acoss.posdoc.ws.resolvers.inputs.search;

import fr.acoss.posdoc.types.Direction;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SortInputDTO {

  private String column;

  private Direction direction;

}
