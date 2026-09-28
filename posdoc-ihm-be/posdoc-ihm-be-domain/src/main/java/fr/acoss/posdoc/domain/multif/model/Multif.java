package fr.acoss.posdoc.domain.multif.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Multif {

  private String code;

  private String libelle;

  private Boolean isNotAuthorisedToBeDeleted;

}
