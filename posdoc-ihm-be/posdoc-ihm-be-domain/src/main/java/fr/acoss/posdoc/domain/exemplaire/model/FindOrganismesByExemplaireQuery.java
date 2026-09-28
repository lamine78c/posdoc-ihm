package fr.acoss.posdoc.domain.exemplaire.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FindOrganismesByExemplaireQuery {
    private String codenv;
    private String codapp;
    private String codcom;
    private String codfic;
    private String codgam;
    private String codsit;
    private String codres;
}
