package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateSupportPayloadDTO {

  private String type;

  private String libelle;

  private Integer poids;

  private Boolean isNotAuthorisedToBeDeleted;

}
