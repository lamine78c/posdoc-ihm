package fr.acoss.posdoc.domain.occurrence.application.model;

import fr.acoss.posdoc.types.GenEtpType;
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
public class DetailsIncident {
    private String signal;
    private LocalDateTime dcreat;
    private String script;
    private String mesano;
    private String ficinf;
    private GenEtpType typetp;
    private String codcom;
    private String codfic;
    private String numcom;
    private String codgam;
    private String codsit;
    private String codres;
}
