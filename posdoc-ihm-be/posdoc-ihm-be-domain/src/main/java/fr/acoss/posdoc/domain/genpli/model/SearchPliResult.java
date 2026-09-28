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
public class SearchPliResult {
    private String status;
    private String numpli;
    private String idtpli;
    private String adres1;
    private String adres2;
    private String adres3;
    private String adres4;
    private String adres5;
    private String adres6;
    private String adres7;
    private String genpro;
    private String codgam;
    private String datdep;
    private String mpsidd;
}
