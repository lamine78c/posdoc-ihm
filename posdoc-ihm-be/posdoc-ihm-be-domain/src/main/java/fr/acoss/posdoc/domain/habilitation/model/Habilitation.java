package fr.acoss.posdoc.domain.habilitation.model;

import fr.acoss.posdoc.types.HabilitationType;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Habilitation {

    private Integer id;

    private Integer parentId;

    private HabilitationType habilitationType;

    private String identite;

    private Integer ordre;

}
