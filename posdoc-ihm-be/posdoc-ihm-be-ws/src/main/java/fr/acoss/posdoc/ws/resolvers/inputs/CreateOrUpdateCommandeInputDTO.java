package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateCommandeInputDTO {

  private String codenv;

  private String codorg;

  private String codapp;

  private String code;

  private String libelle;

}
