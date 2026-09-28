package fr.acoss.posdoc.ws.resolvers.payloads;

import fr.acoss.posdoc.types.HabilitationType;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateHabilitationPayloadDTO {

    private Long id;

    private Integer parentId;

    private HabilitationType habilitationType;

    private String identite;

    private Integer ordre;
}
