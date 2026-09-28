package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateDestinataireInputDTO {

  private String code;

  private String codeOrg;

  private String libelle;

  private String refPri;

}
