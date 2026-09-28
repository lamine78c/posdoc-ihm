package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateParametreDistributionInputDTO {

  private String reference;

  private String libelle;

  private String logicielDistribution;

  private String commandeDistribution;

}
