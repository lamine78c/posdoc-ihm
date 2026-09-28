package fr.acoss.posdoc.ws.resolvers.query;

import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDTO {

    private String profile;

    private String libelleProfile;

    private List<Habilitation> habilitations;

}
