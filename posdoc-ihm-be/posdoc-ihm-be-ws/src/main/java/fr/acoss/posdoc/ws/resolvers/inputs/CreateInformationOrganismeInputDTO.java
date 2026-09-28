package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateInformationOrganismeInputDTO {

  private List<String> organismeId;

  private String message;

  private Boolean actif;

}
