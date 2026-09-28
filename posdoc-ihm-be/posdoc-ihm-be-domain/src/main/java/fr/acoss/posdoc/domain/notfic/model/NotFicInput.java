package fr.acoss.posdoc.domain.notfic.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class NotFicInput {
    private String codnot;
    private String codenv;
    private String codorg;
    private String codapp;
    private String codcom;
    private String codfic;
    private String dnotid;
    private String dnotit;
}
