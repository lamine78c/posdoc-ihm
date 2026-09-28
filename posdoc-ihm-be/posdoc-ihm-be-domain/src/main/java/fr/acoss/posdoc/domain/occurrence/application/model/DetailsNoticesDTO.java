package fr.acoss.posdoc.domain.occurrence.application.model;

import fr.acoss.posdoc.types.NoticePornotType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DetailsNoticesDTO {
    private String codcom;
    private String codfic;
    private String numcom;
    private String codprd;
    private String refimp;
    private String libfic;
    private String codnot;
    private BigDecimal poinot;
    private String fornot;
    private NoticePornotType pornot;
    private String libnot;
    private String codsit;
}