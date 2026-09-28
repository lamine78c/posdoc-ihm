package fr.acoss.posdoc.domain.premas.model;

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
public class Premas {
    private String mascom;
    private String masfic;
    private String codsit;
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String numcom;
    private String presta;
    private LocalDateTime dprevc;
    private LocalDateTime dprevt;
    private LocalDateTime dprevi;
}
