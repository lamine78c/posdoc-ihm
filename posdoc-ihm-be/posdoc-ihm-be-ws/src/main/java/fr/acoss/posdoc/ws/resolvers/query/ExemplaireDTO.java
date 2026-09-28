package fr.acoss.posdoc.ws.resolvers.query;

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
public class ExemplaireDTO {
    private String codenv;

    private String codorg;

    private String codapp;

    private String codcom;

    private String codfic;

    private String codgam;

    private String numexe;

    private String codsit;

    private String codres;

    private String coddes;

    private Integer nbrexe;

    private Boolean exeact;

}
