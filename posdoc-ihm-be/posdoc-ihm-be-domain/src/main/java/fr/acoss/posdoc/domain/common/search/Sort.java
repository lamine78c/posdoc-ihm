package fr.acoss.posdoc.domain.common.search;

import fr.acoss.posdoc.types.Direction;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Sort {

  private String column;

  private Direction direction;

}
