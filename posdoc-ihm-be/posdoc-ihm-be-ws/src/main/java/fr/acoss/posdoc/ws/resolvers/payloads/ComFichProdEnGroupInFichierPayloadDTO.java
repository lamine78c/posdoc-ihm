package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ComFichProdEnGroupInFichierPayloadDTO {

  private String codeCom;

  private String codeFic;

  private String codePrd;

}
