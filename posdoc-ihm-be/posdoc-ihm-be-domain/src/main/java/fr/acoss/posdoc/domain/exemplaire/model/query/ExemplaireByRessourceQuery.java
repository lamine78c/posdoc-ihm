package fr.acoss.posdoc.domain.exemplaire.model.query;

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
public class ExemplaireByRessourceQuery {

    private String codenv;

    private List<String> codorgs;

    private String codapp;

    private String codcom;

    private List<String> codfics;

    private List<String> ressources;

    private String message;

    private Boolean isRessourcesAbsentes;
}
