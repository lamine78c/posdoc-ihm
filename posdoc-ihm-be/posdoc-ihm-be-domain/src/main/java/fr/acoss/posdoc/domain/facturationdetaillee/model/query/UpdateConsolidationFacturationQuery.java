package fr.acoss.posdoc.domain.facturationdetaillee.model.query;

import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateConsolidationFacturation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class UpdateConsolidationFacturationQuery {
    private String codenv;
    private List<String> codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String codsit;
    private List<UpdateConsolidationFacturation> consolidations;
}
