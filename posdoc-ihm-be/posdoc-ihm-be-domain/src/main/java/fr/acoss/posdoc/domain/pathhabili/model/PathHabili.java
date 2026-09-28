package fr.acoss.posdoc.domain.pathhabili.model;

import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class PathHabili {

    private Habilitation habilitation;

    private String path;

}
