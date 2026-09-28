package fr.acoss.posdoc.domain.imprime.model;

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
public class Imprime {

    private String reference;

    private String libelle;

    private String codeRND;

    private String typeComposition;

    private String typeCouleur;

    private Boolean rectoVerso;

    private Boolean isNotAuthorisedToBeDeleted;

}
