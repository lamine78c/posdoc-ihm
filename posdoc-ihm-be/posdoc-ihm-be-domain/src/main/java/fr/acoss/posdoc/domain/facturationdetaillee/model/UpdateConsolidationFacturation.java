package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateConsolidationFacturation {
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String numcom;
    private String codfic;
    private List<UpdateTarifConsolidationFacturation> tarifs;
}
