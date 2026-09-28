package fr.acoss.posdoc.domain.ressource.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@RequiredArgsConstructor
public class Ressource {

  @NonNull
  private String codeEnvironnement;
  @NonNull
  private String codeOrganisme;
  @NonNull
  private String codeApplication;
  @NonNull
  private String codeGamme;
  @NonNull
  private String codeSite;
  @NonNull
  private String codeRessource;

  private String codeServeur;

  private String libelle;

  private String type;

  private String logicielDistribution;

  private String referenceDistributionProduit;

  private String referenceDistributionProduitRecap;

  private String userId;

  private String password;

  private String typeFusion;

  private Boolean destinataire;

  private String fileImpression;

  private String informationUtilisateur;

  private Boolean fileBloquee;

  private Boolean miseSousPli;

  private String profil;

  private Boolean isNotAuthorisedToBeDeleted;
}
