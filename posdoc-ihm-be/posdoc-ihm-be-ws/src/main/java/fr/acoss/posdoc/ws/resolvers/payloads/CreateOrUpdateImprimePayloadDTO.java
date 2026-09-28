package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateImprimePayloadDTO {

  private String reference;

  private String libelle;

  private String codeRND;

  private String typeComposition;

  private String typeCouleur;

  private Boolean rectoVerso;

  private Boolean isNotAuthorisedToBeDeleted;

}
