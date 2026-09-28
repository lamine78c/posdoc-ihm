package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateSupportInputDTO {

  private String type;

  private String libelle;

  private Integer poids;

}
