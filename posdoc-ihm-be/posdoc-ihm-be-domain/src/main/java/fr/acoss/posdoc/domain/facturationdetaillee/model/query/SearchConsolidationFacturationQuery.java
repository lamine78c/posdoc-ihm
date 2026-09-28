package fr.acoss.posdoc.domain.facturationdetaillee.model.query;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class SearchConsolidationFacturationQuery {

    private String codenv;

    private List<String> codorg;

    private String codapp;

    private String percod;

    private String codcom;

    private String codfic;

    private String codsit;
}
