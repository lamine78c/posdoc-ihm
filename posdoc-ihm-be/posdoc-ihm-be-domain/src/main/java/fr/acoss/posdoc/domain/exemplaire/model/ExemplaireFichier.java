package fr.acoss.posdoc.domain.exemplaire.model;

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
public class ExemplaireFichier {

  private String codenv;

  private String codorg;

  private String codapp;

  private String codcom;

  private String codfic;

  private String codgam;

  private String numexe;

  private String codsit;

  private String codres;

  private String coddes;

  private Integer nbrexe;

  private Boolean exeact;

  private String refImprime;

  private String codeProd;

  private String libFichier;

  private Boolean isAdmin;

  private String ficatt;
}
