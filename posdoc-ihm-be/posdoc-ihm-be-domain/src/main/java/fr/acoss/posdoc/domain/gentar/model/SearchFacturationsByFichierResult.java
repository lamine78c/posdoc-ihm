package fr.acoss.posdoc.domain.gentar.model;

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
public class SearchFacturationsByFichierResult {
    private String typtar;
    private String libtar;
    private Integer nbplis;
    private Integer coutot;
}
