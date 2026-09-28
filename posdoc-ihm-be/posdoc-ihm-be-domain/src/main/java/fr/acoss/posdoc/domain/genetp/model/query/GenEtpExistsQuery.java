package fr.acoss.posdoc.domain.genetp.model.query;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GenEtpExistsQuery {

    private String codenv;

    private  String codorg;

    private String codapp;

    private String percod;

    private String codcom;

    private String codfic;

    private String numcom;

    private String codsit;

    private String codres;

    private String codgam;
}
