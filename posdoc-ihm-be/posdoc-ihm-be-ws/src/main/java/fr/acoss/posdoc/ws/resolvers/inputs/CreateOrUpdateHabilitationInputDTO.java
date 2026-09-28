package fr.acoss.posdoc.ws.resolvers.inputs;

import fr.acoss.posdoc.types.HabilitationType;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateHabilitationInputDTO {

    private Long id;

    private Integer parentId;

    private HabilitationType habilitationType;

    private String identite;

    private Integer ordre;
}
