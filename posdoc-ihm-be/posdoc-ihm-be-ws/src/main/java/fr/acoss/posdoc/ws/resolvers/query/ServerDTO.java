package fr.acoss.posdoc.ws.resolvers.query;

import fr.acoss.posdoc.types.Systeme;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ServerDTO {

  private String code;

  private Systeme systeme;

  private String libelle;

  private String adresseIp;

  private Boolean teste;

  private Boolean actif;

}
