package fr.acoss.posdoc.domain.gendoc.model;

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
public class SearchDocDemQuery {
    private String date;
    private List<String> codorgs;
    private String docsta;
    private String coddoc;
    private String typact;
    private String codapp;
    private String codcom;
}
