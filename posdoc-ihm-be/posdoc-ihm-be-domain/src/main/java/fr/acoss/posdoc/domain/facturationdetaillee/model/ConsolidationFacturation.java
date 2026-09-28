package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@SuperBuilder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ConsolidationFacturation extends AbstractFacturationWithTyptar {

    private String codenv;

    private String codorg;

    private String codapp;

    private String percod;

    private String codcom;

    private String codfic;

    private String numcom;

    private String codprd;

    private String codcli;

    private Integer plific;

    private LocalDateTime dfiexp;

    private String codsit;

    private String perime;

    private String compta;
}
