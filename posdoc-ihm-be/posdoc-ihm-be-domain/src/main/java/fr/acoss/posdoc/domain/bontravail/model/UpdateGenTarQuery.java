package fr.acoss.posdoc.domain.bontravail.model;

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
public class UpdateGenTarQuery {
    private String codorg;
    private String codapp;
    private String codcom;
    private String codfic;
    private String codenv;
    private String percod;
    private String numcom;
    private String typtar;
    private Integer nbplis;
    private Integer coutot;
}
