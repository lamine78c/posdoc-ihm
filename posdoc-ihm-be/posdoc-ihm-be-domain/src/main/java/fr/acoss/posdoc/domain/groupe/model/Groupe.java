package fr.acoss.posdoc.domain.groupe.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Groupe {
  private String code;

  private String libelle;

  private String refEnvironnement;

  private String refOrganisme;

  private String refApplication;

  private String typeGroupe;

}
