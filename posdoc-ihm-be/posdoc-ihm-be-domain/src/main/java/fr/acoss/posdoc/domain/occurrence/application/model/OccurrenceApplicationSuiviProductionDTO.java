package fr.acoss.posdoc.domain.occurrence.application.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OccurrenceApplicationSuiviProductionDTO {
    private List<OccurrenceApplicationSuiviProduction> occurrencesApplication;
    private String message;
}
