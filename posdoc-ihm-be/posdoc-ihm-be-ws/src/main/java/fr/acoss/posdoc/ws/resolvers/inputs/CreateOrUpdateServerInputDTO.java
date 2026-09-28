package fr.acoss.posdoc.ws.resolvers.inputs;

import fr.acoss.posdoc.types.Systeme;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateServerInputDTO {

  private String code;

  private Systeme systeme;

  private String libelle;

  private String adresseIp;

  private Boolean teste;

  private Boolean actif;

}
