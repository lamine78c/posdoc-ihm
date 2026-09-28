package fr.acoss.posdoc.domain.facturationdetaillee.model.query;

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
public class DeleteConsolidationFacturationQuery {

    private String codenv;

    private String codorg;

    private String codapp;

    private String percod;

    private String codcom;

    private String numcom;

    private String codfic;

    private String typtar;
}
