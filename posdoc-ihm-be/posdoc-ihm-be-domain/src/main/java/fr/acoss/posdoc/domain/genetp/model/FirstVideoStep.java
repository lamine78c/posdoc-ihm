package fr.acoss.posdoc.domain.genetp.model;

import fr.acoss.posdoc.types.GenEtpType;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
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
@EqualsAndHashCode
public class FirstVideoStep {
    private Integer idetap;
    private GenEtpType typetp;
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String numcom;
    private String codcom;
    private String codfic;
    private String codgam;
    private String statut;
    private Integer codinf;
    private String codser;
    private String codsit;
    private String codres;
    private String coddes;
    private Boolean reedit;
    private String etpfus;
    private String script;
    private Integer idtfus;
    private String numexe;
    private Integer nbrexe;
    private String codsig;
    private String signal;
    private Boolean fabsim;
    private LocalDateTime create;
    private LocalDateTime valide;
    private LocalDateTime debute;
    private LocalDateTime termin;
    private LocalDateTime invali;
    private LocalDateTime suspen;
    private LocalDateTime histor;
    private Integer stepno;
    private Integer numpid;
    private String clefus;
}
