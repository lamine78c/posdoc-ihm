package fr.acoss.posdoc.ws.resolvers.payloads;

import fr.acoss.posdoc.types.TypeRefection;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateApplicationPayloadDTO {

  private String code;

  private String libelle;

  private String codeOrganisation;

  private String codeEnvironnement;

  private String codeSystem;

  private String codeGroupe;

  private String lotNumber;

  private TypeRefection typeRefection;

  private String codeRessource;

  private String codeGamme;

  private String codeServeur;

  private Boolean isNotAuthorisedToBeDeleted;
}
