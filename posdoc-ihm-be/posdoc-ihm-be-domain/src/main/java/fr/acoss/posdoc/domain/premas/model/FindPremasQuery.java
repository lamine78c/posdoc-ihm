package fr.acoss.posdoc.domain.premas.model;

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
public class FindPremasQuery {

    private String codenv;
    private List<String> codorgs;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String codsit;
    private String presta;
}
