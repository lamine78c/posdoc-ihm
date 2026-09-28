package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateFormatPayloadDTO {

  private String code;

  private String libelle;

  private Boolean isNotAuthorisedToBeDeleted;

}
