package fr.acoss.posdoc.domain.parametre.distribution.model;

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
public class CodeEnvAppIsadminPayload {
  private String codenv;
  private String codapp;
  private Boolean isadmin;
}
