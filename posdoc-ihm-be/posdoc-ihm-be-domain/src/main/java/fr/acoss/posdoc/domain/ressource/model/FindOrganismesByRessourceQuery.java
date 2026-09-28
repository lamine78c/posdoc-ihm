package fr.acoss.posdoc.domain.ressource.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FindOrganismesByRessourceQuery {
    private String codenv;
    private String codapp;
    private String codgam;
    private String codsit;
    private String codres;
    private Boolean isadmin;
}
