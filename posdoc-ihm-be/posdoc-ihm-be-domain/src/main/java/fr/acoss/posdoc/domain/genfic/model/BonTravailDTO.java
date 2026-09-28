package fr.acoss.posdoc.domain.genfic.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class BonTravailDTO {
    private String codbon;
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String numcom;
    private Integer pagfic;
    private Integer plific;
    private LocalDateTime dappcr;
    private LocalDateTime drecep;
    private LocalDateTime dfiexp;
    private Integer delmsp;
    private String inform;
    private Integer codpal;
    private String libfic;
    private String codnot;
    private String libnot;
    private String codsit;
    private String typtar;

}
