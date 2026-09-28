package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateClientInputDTO {

  private String code;

  private String libelle;

  private String codeAlliage;

}
