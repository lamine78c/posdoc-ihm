package fr.acoss.posdoc.domain.ressource.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class RessourceCompositeIdModel {

  private String codeEnvironnement;

  private String codeOrganisme;

  private String codeApplication;

  private String codeGamme;

  private String codeSite;

  private String codeRessource;

}
