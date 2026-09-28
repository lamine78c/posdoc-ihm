package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateInformationOrganismePayloadDTO {

  private Integer id;

  private String organismeId;

  private String message;

  private Boolean actif;

}
