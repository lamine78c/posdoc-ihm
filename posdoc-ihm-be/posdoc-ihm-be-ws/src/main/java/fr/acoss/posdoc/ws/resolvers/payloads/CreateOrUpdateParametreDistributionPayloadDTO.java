package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateParametreDistributionPayloadDTO {

  private String reference;

  private String libelle;

  private String logicielDistribution;

  private String commandeDistribution;

  private Boolean isNotAuthorisedToBeDeleted;

}
