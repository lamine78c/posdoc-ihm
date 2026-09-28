package fr.acoss.posdoc.domain.exemplaire.model;

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
public class RessourceExistForOrganismeSiteQuery {

    private String codenv;

    private String codorg;

    private String codapp;

    private String codsit;

    private String codgam;

    private String codres;

    private String genericOrganisme;

}
