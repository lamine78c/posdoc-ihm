package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DeleteAdresseRetourInputDTO {

  private String code;

  private String codeOrganisme;

}
