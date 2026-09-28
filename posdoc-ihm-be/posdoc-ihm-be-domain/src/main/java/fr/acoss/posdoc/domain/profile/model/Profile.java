package fr.acoss.posdoc.domain.profile.model;

import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Profile {

    @SuppressWarnings("java:S1700")
    private String profile;

    private String libelleProfile;

    private List<Habilitation> habilitations;
}
