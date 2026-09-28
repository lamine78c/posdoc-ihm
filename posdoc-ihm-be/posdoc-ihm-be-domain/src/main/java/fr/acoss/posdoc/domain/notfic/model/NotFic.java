package fr.acoss.posdoc.domain.notfic.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class NotFic {
    private String codnot;
    private String codenv;
    private String codorg;
    private String codapp;
    private String codcom;
    private String codfic;
    private String dnotid;
    private String dnotit;
    private BigDecimal maxnot;
    private BigDecimal curnot;

}
