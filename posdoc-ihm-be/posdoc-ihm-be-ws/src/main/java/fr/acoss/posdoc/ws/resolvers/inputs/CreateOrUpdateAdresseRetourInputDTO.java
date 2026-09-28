package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateAdresseRetourInputDTO {

  private String code;

  private String codeOrganisme;

  private String adresse1;

  private String adresse2;

  private String adresse3;

  private String adresse4;

}
