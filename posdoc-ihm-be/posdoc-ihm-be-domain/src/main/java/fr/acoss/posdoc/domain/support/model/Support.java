package fr.acoss.posdoc.domain.support.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Support {

  private String type;

  private String libelle;

  private Integer poids;

  private Boolean isNotAuthorisedToBeDeleted;

}
