package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GroupeDTO {

  private String code;

  private String libelle;

  private String refEnvironnement;

  private String refOrganisme;

  private String refApplication;

  private String typeGroupe;

}
