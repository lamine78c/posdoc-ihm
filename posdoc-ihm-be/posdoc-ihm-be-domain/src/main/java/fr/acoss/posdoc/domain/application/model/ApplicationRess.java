package fr.acoss.posdoc.domain.application.model;

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
public class ApplicationRess {

  private String code;

  private String libelle;

  private String codeOrganisation;

  private String codeEnvironnement;

  private String codeSystem;

  private String codeGroupe;

  private String lotNumber;

  private String codeRessource;

  private String codeGamme;

  private String codeServeur;

}
