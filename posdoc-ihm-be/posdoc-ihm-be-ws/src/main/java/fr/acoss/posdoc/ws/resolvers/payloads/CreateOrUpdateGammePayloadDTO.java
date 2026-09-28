package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateGammePayloadDTO {

  private String code;

  private String libelle;

  private String codeVerrou;

  private Boolean isNotAuthorisedToBeDeleted;

}
