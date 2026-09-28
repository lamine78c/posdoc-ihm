package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DeleteApplicationInputDTO {


  private String codeEnvironnement;

  private String codeOrganisation;

  private String code;



}
