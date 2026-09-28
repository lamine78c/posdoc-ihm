package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateOrganismePayloadDTO {

  private String code;

  private String libelle;

  private String adresse1;

  private String adresse2;

  private String adresse3;

  private String adresse4;

  private String type;

  private String codeRegion;

  private String codeSite;

  private Boolean isNotAuthorisedToBeDeleted;

}
