package fr.acoss.posdoc.domain.parametre.edition.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ParametreEdition {

  private String reference;

  private String type;

  private String libelle;

  private Integer lineNumber;

  private Integer columnNumber;

  private Integer length;


}
