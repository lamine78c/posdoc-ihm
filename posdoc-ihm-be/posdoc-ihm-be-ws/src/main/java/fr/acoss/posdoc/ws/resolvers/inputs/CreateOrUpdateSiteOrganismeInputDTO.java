package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateSiteOrganismeInputDTO {

  private String codeOrganisme;

  private String codeSiteDematerialisation;

  private String codeSiteProdocs;

}
