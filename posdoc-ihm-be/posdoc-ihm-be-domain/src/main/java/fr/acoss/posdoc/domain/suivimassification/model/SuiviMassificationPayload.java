package fr.acoss.posdoc.domain.suivimassification.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SuiviMassificationPayload {

    private String codenv;
    private List<String> sitesMas;
    private String periodeDebut;
    private String periodeFin;
}
