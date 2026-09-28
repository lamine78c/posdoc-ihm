package fr.acoss.posdoc.domain.occurrence.application.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class OccurrenceApplicationSuiviProductionInput {
    private String codenv;

    private List<String> codorgs;

    private String codapp;

    private String percod;

    private String codsit;
}
