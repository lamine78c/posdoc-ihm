package fr.acoss.posdoc.ws.resolvers.payloads;


import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateProfilePayloadDTO {

    private String profile;

    private String libelleProfile;

    private List<Habilitation> habilitations;

}
