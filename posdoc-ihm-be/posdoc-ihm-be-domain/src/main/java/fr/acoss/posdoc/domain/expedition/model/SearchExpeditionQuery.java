package fr.acoss.posdoc.domain.expedition.model;

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
public class SearchExpeditionQuery {

    private String codenv;

    private List<String> codorg;

    private String codapp;

    private String codcom;

    private String codfic;

    private String codcli;

    private String percod;

    private String codsit;

    private String dfiexpDeb;

    private String dfiexpFin;

    private Boolean isNotNullDfiexp;
}
