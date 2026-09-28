package fr.acoss.posdoc.domain.genfic.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OccurrencesFichiersFiltersInput {
    private String codenv;
    private List<String> codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String codprd;
    private String codsta;
    private String refimp;
}
