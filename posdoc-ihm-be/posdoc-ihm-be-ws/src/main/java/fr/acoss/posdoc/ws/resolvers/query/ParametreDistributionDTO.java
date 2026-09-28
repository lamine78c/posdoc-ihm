package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ParametreDistributionDTO {

  private String reference;

  private String libelle;

  private String logicielDistribution;

  private String commandeDistribution;

}
