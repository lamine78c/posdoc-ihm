package fr.acoss.posdoc.domain.hispro.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class HisPro {

  private String codeEnv;

  private String codeOrg;

  private String codeApp;

  // période codifiée
  private String perCod;

  private String codeCom;

  // numéro séquence
  private String numCom;

  private String codeFic;

  private String codeGam;

  // statut
  private String proSta;

  // numéro info.Statut
  private String proInf;

  // booléen réfection
  private boolean prefec;

  // date/heure crée
  private LocalDateTime dprodc;

  // date/heure débuté
  private LocalDateTime dprodd;

  // date/heure terminé
  private LocalDateTime dprodt;

  // date/heure
  private LocalDateTime dprods;

  // date/heure
  private LocalDateTime dprodh;

  // nbr pages
  private Integer pagFic;

  // nbr plis
  private Integer pliFic;

  // nbr rejets
  private Integer rejFic;

}
