package fr.acoss.posdoc.domain.gendoc.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GenDoc {

    private String datdem;

    private Integer numdem;

    private String codenv;

    private String codorg;

    private String codapp;

    private String percod;

    private String numcom;

    private String codcom;

    private String codfic;

    private String coddoc;

    private String refdem;

    private String typact;

    private boolean imprim;

    private String docsta;

    private String docinf;

    private LocalDateTime ddodeb;

    private LocalDateTime ddofin;

    private LocalDateTime ddosus;

    private Integer tpscom;

    private Boolean retour;

    private LocalDateTime ddoimp;

    private LocalDateTime ddoexp;

}
