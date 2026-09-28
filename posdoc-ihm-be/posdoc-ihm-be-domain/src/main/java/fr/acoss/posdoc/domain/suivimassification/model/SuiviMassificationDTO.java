package fr.acoss.posdoc.domain.suivimassification.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SuiviMassificationDTO {

    private String masper;
    private String mascom;
    private String masfic;
    private String masnum;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String numcom;
    private String codenv;
    private String libFichier;
    private String libsup;
    private String codprd;
    private String masuti;
    private Integer pagFic;
    private Integer pliFic;
    private String codcli;
    private String codsit;
}
