package fr.acoss.posdoc.domain.destinataire.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Destinataire {

  private String code;

  private String codeOrg;

  private String libelle;

  private String refPri;

  private Boolean isNotAuthorisedToBeDeleted;
}
