package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateParametreEditionPayloadDTO {

  private String reference;

  private String type;

  private String libelle;

  private Integer lineNumber;

  private Integer columnNumber;

  private Integer length;

}
