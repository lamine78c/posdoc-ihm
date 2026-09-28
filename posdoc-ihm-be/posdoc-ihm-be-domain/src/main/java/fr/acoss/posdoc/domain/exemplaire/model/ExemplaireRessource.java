package fr.acoss.posdoc.domain.exemplaire.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExemplaireRessource {

    private Boolean exemplaireExists;

    private String codgam;

    private String codres;

    private String codsit;

    private String codorg;

    private Boolean etat;

    private String coddes;

    private Boolean hasProfil;
}
