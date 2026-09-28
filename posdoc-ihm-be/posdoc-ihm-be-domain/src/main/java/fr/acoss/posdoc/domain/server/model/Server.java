package fr.acoss.posdoc.domain.server.model;

import fr.acoss.posdoc.types.Systeme;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Server {

  private String code;

  private Systeme systeme;

  private String libelle;

  private String adresseIp;

  private Boolean teste;

  private Boolean actif;

  private Boolean isNotAuthorisedToBeDeleted;

}
