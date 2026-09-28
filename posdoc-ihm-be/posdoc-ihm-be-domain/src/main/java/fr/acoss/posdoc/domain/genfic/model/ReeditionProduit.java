package fr.acoss.posdoc.domain.genfic.model;

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
public class ReeditionProduit {
    private String codcom;
    private String codfic;
    private String numcom;
    private String refimp;
    private String codprd;
    private String libfic;
    private Integer pagfic;
    private String codgam;
    private String codsit;
    private String codres;
    private String coddes;
    private Integer nbrexe;
    private String codorg;
    private String percod;
    private Boolean reedit;
}
