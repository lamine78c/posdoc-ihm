package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class ConsolidationFacturationWithAllColumns {

    private String codenv;

    private String codorg;

    private String codapp;

    private String percod;

    private String codcom;

    private String codfic;

    private String numcom;

    private String codprd;

    private String codcli;

    private String codsit;

    private Integer plific;

    private Float coufic;

    private LocalDateTime dfiexp;

    private List<TarifFacturationDetaillee> tarifs;

}
