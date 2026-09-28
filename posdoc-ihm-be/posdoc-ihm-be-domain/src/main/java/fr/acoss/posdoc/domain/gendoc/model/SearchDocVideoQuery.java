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
public class SearchDocVideoQuery {
    private String datdem ;
    private String docsta;
    private String codenv;
    private String coddoc;
    private String typact;

}
