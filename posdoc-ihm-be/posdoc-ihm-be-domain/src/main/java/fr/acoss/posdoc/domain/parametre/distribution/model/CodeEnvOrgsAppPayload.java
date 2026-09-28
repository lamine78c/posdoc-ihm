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
public class CodeEnvOrgsAppPayload {
  private String codenv;
  private String[] codorgs;
  private String codapp;
  private Boolean isProfilAdmin;
}
