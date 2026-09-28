package fr.acoss.posdoc.domain.massification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SearchMassificationQuery {
    private String codenv;
    private List<String> codorgs;
    private String codapp;
    private String codcom;
    private String codfic;
    private String codcli;
    private String percod;
    private String masuti;
    private String codsit;
}
