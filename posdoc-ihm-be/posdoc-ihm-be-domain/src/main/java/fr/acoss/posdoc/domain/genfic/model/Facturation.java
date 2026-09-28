package fr.acoss.posdoc.domain.genfic.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Facturation {
    private String codcom;
    private String codfic;
    private String numcom;
    private String codprd;
    private String codcli;
    private String typtar;
    private Integer nbplis;
    private Integer coutot;
    private LocalDateTime dfiexp;
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
}
