package fr.acoss.posdoc.domain.fichier.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class EnvAppRefImpInFichier {
  private String codeEnv;

  private String codeApp;

  private String refImprime;
}
