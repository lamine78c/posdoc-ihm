package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DeleteRessourceInputDTO {

  private String codeEnvironnement;

  private String codeOrganisme;

  private String codeApplication;

  private String codeGamme;

  private String codeSite;

  private String codeRessource;

}
