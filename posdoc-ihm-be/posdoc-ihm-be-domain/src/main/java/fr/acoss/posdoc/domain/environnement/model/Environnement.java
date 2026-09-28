package fr.acoss.posdoc.domain.environnement.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Environnement {

  private String code;

  private String libelle;

  private Boolean isNotAuthorisedToBeDeleted;

}
