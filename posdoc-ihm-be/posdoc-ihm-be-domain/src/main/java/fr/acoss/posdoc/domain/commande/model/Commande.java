package fr.acoss.posdoc.domain.commande.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Commande {

  private String codenv;

  private String codorg;

  private String codapp;

  private String code;

  private String libelle;

  private String codreg;

  private Boolean isNotAuthorisedToBeDeleted;

}
