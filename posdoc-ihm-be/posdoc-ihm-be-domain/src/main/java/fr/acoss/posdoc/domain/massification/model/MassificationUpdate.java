package fr.acoss.posdoc.domain.massification.model;

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
public class MassificationUpdate {
    private String mascom;
    private String masfic;
    private String codsit;
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String numcom;
    private String codeGam;
    private Integer pagFic;
    private Integer pliFic;
    private String codcli;
    private String codbon;
    private String masuti;
    private String libfic;
    private String typsup;
    private Boolean isAllFichiersInPoolSelected;
}
