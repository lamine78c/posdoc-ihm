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
public class ExemplaireExistsQuery {

    private String codenv;

    private String codorg;

    private String codapp;

    private String codcom;

    private String codfic;

    private String codgam;

    private String codsit;

    private String codres;

    private String numexe;

}
