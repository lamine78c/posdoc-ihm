package fr.acoss.posdoc.domain.tarif.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class TarifAlreadyExistsOnPeriodQuery {
    private LocalDate startDate;

    private LocalDate endDate;

    private String typtar;

    private String numtar;
}
