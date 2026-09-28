package fr.acoss.posdoc.domain.genapp.model;

import fr.acoss.posdoc.types.TypeRefection;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GenApp {

  private String codeEnv;

  private String codeOrg;

  private String codeApp;

  private String perCod;

  private String appsta;

  private String appinf;

  private Boolean arefec;

  private LocalDateTime dapplc;

  private LocalDateTime dappld;

  private LocalDateTime dapplt;

  private LocalDateTime dappls;

  private LocalDateTime dapplh;

  private TypeRefection typref;

  private Boolean manuel;

  private String sitori;

}
