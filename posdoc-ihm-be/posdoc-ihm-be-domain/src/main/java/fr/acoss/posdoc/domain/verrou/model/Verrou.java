package fr.acoss.posdoc.domain.verrou.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Verrou {

  private String code;

  private String libelle;

  private Integer maxExecution;

  private Boolean isNotAuthorisedToBeDeleted;

}
