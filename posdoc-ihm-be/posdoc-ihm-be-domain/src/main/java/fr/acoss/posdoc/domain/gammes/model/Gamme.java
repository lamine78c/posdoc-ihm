package fr.acoss.posdoc.domain.gammes.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Gamme {

  private String code;

  private String libelle;

  private String codeVerrou;

  private Boolean isNotAuthorisedToBeDeleted;

}
