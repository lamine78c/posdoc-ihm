package fr.acoss.posdoc.domain.exemplaire.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Exemplaire {

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
}
