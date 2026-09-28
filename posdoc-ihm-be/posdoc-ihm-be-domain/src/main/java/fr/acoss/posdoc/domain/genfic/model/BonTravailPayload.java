package fr.acoss.posdoc.domain.genfic.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class BonTravailPayload {
    private String codenv;
    private List<String> codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String codcli;
    private String codbon;
    private String dappcrDeb;
    private String dappcrFin;
    private String dfiexpDeb;
    private String dfiexpFin;
    private Boolean isDateEmpty;
    private String delmsp;
    private String codsit;
}
