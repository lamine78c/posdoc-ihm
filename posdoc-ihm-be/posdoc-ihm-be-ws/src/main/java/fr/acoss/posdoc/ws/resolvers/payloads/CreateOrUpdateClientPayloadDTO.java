package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateClientPayloadDTO {

  private String code;

  private String libelle;

  private String codeAlliage;

  private Boolean isNotAuthorisedToBeDeleted;

}
