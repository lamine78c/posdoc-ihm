package fr.acoss.posdoc.ws.resolvers.query;

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
public class GenEtpDTO {

    private Integer id;

    private String typetp;

    private String codenv;

    private String codorg;

    private String codapp;

    private String percod;

    private String codcom;

    private String numcom;

    private String codfic;

    private String codgam;

    private String numexe;

    private String codres;

    private String codsit;

    private String coddes;

    private Integer nbrexe;

    private String codser;

    private String codsig;

    private String signal;

    private boolean reedit;

    private boolean fabsim;

    private String statut;

    private Integer codinf;

    private LocalDateTime create;

    private LocalDateTime valide;

    private LocalDateTime debute;

    private LocalDateTime termin;

    private LocalDateTime invali;

    private LocalDateTime suspen;

    private LocalDateTime histor;

    private String script;

    private Integer stepno;

    private Integer numpid;

    private String etpfus;

    private String clefus;

    private Integer idtfus;

}
