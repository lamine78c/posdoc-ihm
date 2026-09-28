package fr.acoss.posdoc.domain.organisme.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Organisme {

  private String code;

  private String libelle;

  private String adresse1;

  private String adresse2;

  private String adresse3;

  private String adresse4;

  private String type;

  private String codeRegion;

  private String codeSite;

  private Boolean isNotAuthorisedToBeDeleted;

}
