package fr.acoss.posdoc.domain.exemplaire.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ExemplaireByResource {

    private String codenv;

    private String codorg;

    private String codapp;

    private String codcom;

    private String codfic;

    private String message;

    private List<ExemplaireRessource> ressources;
}
