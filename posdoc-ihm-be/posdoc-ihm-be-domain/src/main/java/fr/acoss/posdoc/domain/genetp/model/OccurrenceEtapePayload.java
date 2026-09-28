package fr.acoss.posdoc.domain.genetp.model;

import fr.acoss.posdoc.types.GenEtpType;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class OccurrenceEtapePayload {
    private String codenv;
    private List<String> codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String codgam;
    private String codsit;
    private String codres;
    private String codser;
    private GenEtpType typetp;
    private String statut;
    private String codver;
    private String typdat;
    private String datdeb;
    private String datfin;
}