package fr.acoss.posdoc.domain.occurrence.application.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DetailsCommandesFichiersPayload {
    private String codcom;
    private String numcom;
    private String codfic;
    private String libelle;
    private String codprd;
    private String refimp;
    private String libfic;
    private String ficsta;
    private String ficinf;
    private LocalDateTime dappcr;
    private LocalDateTime dfichd;
    private LocalDateTime dficht;
    private LocalDateTime dfichs;
    private Boolean frefec;
    private Boolean ficvid;
}
