package fr.acoss.posdoc.domain.facturationdetaillee.model.query;

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
public class SearchFacturationDetailleeQuery {

    private String dfiexpDeb;

    private String dfiexpFin;

    private List<String> codorgs;

    private List<String> codclis;

    private List<String> typtars;

    private String codenv;

    private String codapp;

    private String codcom;

    private String codfic;

    private String codsit;

    private boolean showTotal;
}