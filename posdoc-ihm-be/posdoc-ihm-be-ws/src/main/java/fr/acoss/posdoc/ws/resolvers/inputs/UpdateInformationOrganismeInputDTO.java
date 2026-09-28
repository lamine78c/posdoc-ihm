package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class UpdateInformationOrganismeInputDTO {

  private Integer id;

  private String message;

  private Boolean actif;

}
