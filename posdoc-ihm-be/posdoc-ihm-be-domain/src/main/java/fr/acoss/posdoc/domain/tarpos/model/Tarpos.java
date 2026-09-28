package fr.acoss.posdoc.domain.tarpos.model;

import fr.acoss.posdoc.domain.tarif.model.Tarif;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Tarpos {
    private String type;
    private String libelle;
    private Integer ordre;
    private Boolean tlibre;
    private Boolean compta;
    private Boolean perime;
    private Boolean isNotAuthorisedToBeDeleted;
    private List<Tarif> tarifs;

    public Tarpos(String type, String libelle, Integer ordre, Boolean tlibre, Boolean compta, Boolean perime) {
        this.type = type;
        this.libelle = libelle;
        this.ordre = ordre;
        this.tlibre = tlibre;
        this.compta = compta;
        this.perime = perime;
    }
    public Tarpos(String type, String libelle, Integer ordre, Boolean tlibre, Boolean compta, Boolean perime,
                  Boolean isNotAuthorisedToBeDeleted) {
        this.type = type;
        this.libelle = libelle;
        this.ordre = ordre;
        this.tlibre = tlibre;
        this.compta = compta;
        this.perime = perime;
        this.isNotAuthorisedToBeDeleted = isNotAuthorisedToBeDeleted;
    }
}
