package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateVerrouPayloadDTO {

  private String code;

  private String libelle;

  private Integer maxExecution;

  private Boolean isNotAuthorisedToBeDeleted;

}
