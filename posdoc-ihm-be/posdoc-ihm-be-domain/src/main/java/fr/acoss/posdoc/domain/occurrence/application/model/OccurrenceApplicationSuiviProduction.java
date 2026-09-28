package fr.acoss.posdoc.domain.occurrence.application.model;

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
public class OccurrenceApplicationSuiviProduction {
    private String codenv;

    private String codorg;

    private String codapp;

    private String percod;

    private String appsta;

    private String appinf;

    private Boolean arefec;

    private LocalDateTime dappld;

    private LocalDateTime dapplt;

    private LocalDateTime dappls;

    private Boolean manuel;

    private String codsit;

    private String codcom;

    private String codfic;

    private String numcom;

    private String codprd;

    private String ficsta;

    private String ficinf;

    private Boolean frefec;

    private Boolean ficvid;

    private LocalDateTime dappcr;

    private LocalDateTime dfichd;

    private LocalDateTime dficht;

    private LocalDateTime dfichs;
}
