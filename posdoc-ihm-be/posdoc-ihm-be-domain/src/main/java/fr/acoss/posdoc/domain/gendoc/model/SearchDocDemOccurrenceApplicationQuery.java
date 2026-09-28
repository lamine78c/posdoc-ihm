package fr.acoss.posdoc.domain.gendoc.model;

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
public class SearchDocDemOccurrenceApplicationQuery {
    private String codenv;

    private String codorg;

    private String codapp;

    private String percod;

    private String codcom;

    private String codfic;

    private String numcom;
}
