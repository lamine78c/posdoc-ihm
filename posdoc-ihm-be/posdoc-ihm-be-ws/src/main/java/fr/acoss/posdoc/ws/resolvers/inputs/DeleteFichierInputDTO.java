package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DeleteFichierInputDTO {

  private String codeEnv;

  private String codeOrg;

  private String codeApp;

  private String codeCom;

  private String codeFich;

}
