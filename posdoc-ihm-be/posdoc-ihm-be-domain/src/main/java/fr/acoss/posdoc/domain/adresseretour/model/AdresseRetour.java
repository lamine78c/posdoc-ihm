package fr.acoss.posdoc.domain.adresseretour.model;

import fr.acoss.posdoc.domain.fichier.model.Fichier;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class AdresseRetour {

    public AdresseRetour(
            String code, String codeOrganisme,
            String adresse1, String adresse2,
            String adresse3, String adresse4,
            Boolean isNotAuthorisedToBeDeleted
    ) {
        this.code = code;
        this.codeOrganisme = codeOrganisme;
        this.adresse1 = adresse1;
        this.adresse2 = adresse2;
        this.adresse3 = adresse3;
        this.adresse4 = adresse4;
        this.isNotAuthorisedToBeDeleted = isNotAuthorisedToBeDeleted;
    }

    private String code;

    private String codeOrganisme;

    private String adresse1;

    private String adresse2;

    private String adresse3;

    private String adresse4;

    private List<Fichier> fichiers;

    private Boolean isNotAuthorisedToBeDeleted;
}
