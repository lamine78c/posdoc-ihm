package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateSiteOrganismePayloadDTO {

  private String codeOrganisme;

  private String codeSiteDematerialisation;

  private String codeSiteProdocs;

}
