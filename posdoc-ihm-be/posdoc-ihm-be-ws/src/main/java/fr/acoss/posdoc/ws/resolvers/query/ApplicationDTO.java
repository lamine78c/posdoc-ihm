package fr.acoss.posdoc.ws.resolvers.query;

import fr.acoss.posdoc.types.TypeRefection;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationDTO {

  private String code;

  private String libelle;

  private String codeOrganisation;

  private String codeEnvironnement;

  private String codeSystem;

  private String codeGroupe;

  private String lotNumber;

  private TypeRefection typeRefection;

}
