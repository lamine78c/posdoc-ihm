package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ImprimeDTO {

  private String reference;

  private String libelle;

  private String codeRND;

  private String typeComposition;

  private String typeCouleur;

  private Boolean rectoVerso;

}
