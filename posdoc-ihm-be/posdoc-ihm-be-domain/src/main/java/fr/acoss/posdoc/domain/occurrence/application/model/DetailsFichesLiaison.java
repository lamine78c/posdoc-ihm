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
public class DetailsFichesLiaison {
    private String coddes;

    private String codcom;

    private String codfic;

    private String numcom;

    private String codgam;

    private String codprd;

    private String refimp;

    private Integer nbrexe;

    private Integer pagfic;

    private String libfic;

    private String libdes;
}
