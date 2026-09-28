package fr.acoss.posdoc.domain.genscr.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GenScr {

  private String codeEnv;

  private String codeOrg;

  private String codeApp;

  private String perCod;

  private String numScr;

  private String signal;

  private String script;

  private String mesano;

  private String ficinf;

  private LocalDateTime dcreat;

  private Integer idetap;
}
