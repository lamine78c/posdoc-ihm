package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateSiteCNPPayloadDTO {

  private String code;

  private String host;

  private String username;

  private String password;

  private String ressourceDelestage;

  private String organismeMassification;

  private Boolean isNotAuthorisedToBeDeleted;

}
