package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class EnvAppRefImpEnGroupInFichierPayloadDTO {

  private String codeEnv;

  private String codeApp;

  private String refImprime;

}
