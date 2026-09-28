package fr.acoss.posdoc.domain.parametre.distribution.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ParametreDistribution {

  private String reference;

  private String libelle;

  private String logicielDistribution;

  private String commandeDistribution;

  private Boolean isNotAuthorisedToBeDeleted;

}
