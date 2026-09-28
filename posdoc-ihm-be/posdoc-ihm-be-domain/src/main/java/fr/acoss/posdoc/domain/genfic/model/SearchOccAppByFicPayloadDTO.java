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
public class SearchOccAppByFicPayloadDTO {
    private String libfic;
    private String libfor;
    private String libsup;
    private String libmul;
    private String reffor;
    private String refimp;
    private String refsup;
    private String reftri;
    private String refech;
    private String ficatt;
    private String ficsta;
    private Integer maxpag;
    private String codprd;
    private Integer repexp;
    private String typsig;
    private String codcli;
    private String codrnd;
    private String ficinf;
    private LocalDateTime dappcr;
    private LocalDateTime dfichd;
    private LocalDateTime dficht;
    private LocalDateTime dfichs;
    private String codsit;
    private Boolean eclate;
}
