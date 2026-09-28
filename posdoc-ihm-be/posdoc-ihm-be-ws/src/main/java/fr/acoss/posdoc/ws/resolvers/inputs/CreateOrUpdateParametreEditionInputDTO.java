package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateParametreEditionInputDTO {

  private String reference;

  private String type;

  private String libelle;

  private Integer lineNumber;

  private Integer columnNumber;

  private Integer length;

}
