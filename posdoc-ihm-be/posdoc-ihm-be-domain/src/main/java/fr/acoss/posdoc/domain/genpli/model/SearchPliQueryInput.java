package fr.acoss.posdoc.domain.genpli.model;

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
public class SearchPliQueryInput {
    private String dtdeb;
    private String dtfin;
    private String numpli;
    private String idtpli;
    private String adress;
    private Boolean isCnav;
}
