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
public class SearchOccurrenceApplicationInput {
    private String codEnv;
    private String codSit;
    private String codApp;
    private String tri;
    private String currDate;
    private List<String> codOrgs;
    private Boolean ext;
}
