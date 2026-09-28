package fr.acoss.posdoc.domain.pathhabili.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PathHabiliCompletDTO {

    private String libelle;

    private String path;

}
