package fr.acoss.posdoc.domain.genpli.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GenPli {
    private String numpli;
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String numcom;
    private String plista;
    private String pliinf;
    private String zoncli;
    private LocalDateTime dplidc;
    private LocalDateTime dplidd;
    private LocalDateTime dplidt;
    private LocalDateTime dplide;
    private LocalDateTime dplidh;
    private String nbpage;
    private String nbfeui;
    private String edtype;
    private String poipli;
    private String coupli;
    private String idtpli;
    private String codpos;
    private String codpay;
    private String adres1;
    private String adres2;
    private String adres3;
    private String adres4;
    private String adres5;
    private String adres6;
    private String adres7;
    private String expad1;
    private String expad2;
    private String expad3;
    private String expad4;
    private String genpro;
    private String infcl1;
    private String infcl2;
    private LocalDate datdep;
    private String mpsidd;
    private String status;
    private String cominf;
    private String codgam;
}
