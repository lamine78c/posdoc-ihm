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
public class OccurrenceApplicationInput {
    private String codEnv;
    private String codOrg;
    private String codApp;
    private String perCod;
}
