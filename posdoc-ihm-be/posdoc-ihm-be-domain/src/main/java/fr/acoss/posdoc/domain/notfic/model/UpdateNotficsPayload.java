package fr.acoss.posdoc.domain.notfic.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class UpdateNotficsPayload {
    private String codnot;
    private String codenv;
    private String codorg;
    private String codapp;
    private String codcom;
    private String codfic;
    private String dnotid;
    private String dnotit;
    private Integer maxnot;
}
