package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateImprimeInputDTO {

  private String reference;

  private String libelle;

  private String codeRND;

  private String typeComposition;

  private String typeCouleur;

  private Boolean rectoVerso;

}
