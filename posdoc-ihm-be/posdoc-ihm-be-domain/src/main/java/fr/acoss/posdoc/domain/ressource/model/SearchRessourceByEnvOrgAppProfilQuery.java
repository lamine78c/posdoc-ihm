package fr.acoss.posdoc.domain.ressource.model;

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
public class SearchRessourceByEnvOrgAppProfilQuery {

    private String codenv;

    private String codorg;

    private String codapp;

    private Boolean isProfilAdmin;
}
