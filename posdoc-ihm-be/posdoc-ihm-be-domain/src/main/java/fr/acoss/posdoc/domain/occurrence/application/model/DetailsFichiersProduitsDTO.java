package fr.acoss.posdoc.domain.occurrence.application.model;

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
public class DetailsFichiersProduitsDTO {
    private String codcom;
    private String codfic;
    private String numcom;
    private String refimp;
    private String codprd;
    private String libFichier;
    private Integer pagFic;
    private String codgam;
    private String codsit;
    private String codres;
    private String coddes;
    private Integer nbrexe;
}
