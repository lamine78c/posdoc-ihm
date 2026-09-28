package fr.acoss.posdoc.domain.gendoc.model;

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
public class DocDematerialise {

    private String datdem;
    private String numdem;
    private String codapp;
    private String codenv;
    private String codorg;
    private String percod;
    private String codcom;
    private String codfic;
    private String coddoc;
    private String refdem;
    private String typact;
    private Boolean imprim;
    private String docsta;
    private String docinf;
    private String ddodeb;
    private String ddofin;
    private String ddosus;
    private String tpscom;
    private String libinf;
    private String codeSiteDematerialisation;

}
