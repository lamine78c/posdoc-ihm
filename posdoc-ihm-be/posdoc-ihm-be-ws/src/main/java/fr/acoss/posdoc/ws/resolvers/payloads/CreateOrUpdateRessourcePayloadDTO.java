package fr.acoss.posdoc.ws.resolvers.payloads;

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
public class CreateOrUpdateRessourcePayloadDTO {

    private String codeEnvironnement;

    private String codeOrganisme;

    private String codeApplication;

    private String codeGamme;

    private String codeSite;

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
