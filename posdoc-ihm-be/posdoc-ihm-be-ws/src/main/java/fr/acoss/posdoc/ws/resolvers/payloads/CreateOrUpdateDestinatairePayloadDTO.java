package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateDestinatairePayloadDTO {

  private String code;

  private String libelle;

  private String codeOrg;

  private String refPri;

  private Boolean isNotAuthorisedToBeDeleted;

}
