package fr.acoss.posdoc.domain.genetp.model;

import fr.acoss.posdoc.types.GenEtpType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GenEtp {

  private Integer id;

  private GenEtpType typetp;

  private String codenv;

  private String codorg;

  private String codapp;

  private String percod;

  private String codcom;

  private String numcom;

  private String codfic;

  private String codgam;

  private String numexe;

  private String codres;

  private String codsit;

  private String coddes;

  private Integer nbrexe;

  private String codser;

  private String codsig;

  private String signal;

  private Boolean reedit;

  private Boolean fabsim;

  private String statut;

  private Integer codinf;

  private LocalDateTime create;

  private LocalDateTime valide;

  private LocalDateTime debute;

  private LocalDateTime termin;

  private LocalDateTime invali;

  private LocalDateTime suspen;

  private LocalDateTime histor;

  private String script;

  private Integer stepno;

  private Integer numpid;

  private String etpfus;

  private String clefus;

  private Integer idtfus;
}
