package fr.acoss.posdoc.domain.papaad.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Papaad {


  private String codeCommande;

  ///!\ Attention, le champ 'codeFichier' correspond au 'Code Produit' dans l'IHM
  private String codeFichier;

  private String codeNotif;

  private String libelle;

  private Boolean periode;

  private String codeRND;

  private String appPro;

  private String typeHas;

  private String format;

  private String isUrib;

  private Boolean nsTruc;

  private Boolean imprime;

  private Boolean huissier;

  private Boolean numNot;

  private Boolean strRaf;

  private Boolean contrat;

  private Boolean medele;

  private Boolean idtbcc;

}
