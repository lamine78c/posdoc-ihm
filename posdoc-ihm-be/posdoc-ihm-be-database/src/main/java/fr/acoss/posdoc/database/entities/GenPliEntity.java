package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "genpli")
public class GenPliEntity {

  @Id
  @Column(name = "c101_numpli", nullable = false)
  private String numpli;

  @Column(name = "s101_codenv", nullable = false)
  private String codenv;

  @Column(name = "s101_codorg", nullable = false)
  private String codorg;

  @Column(name = "s101_codapp", nullable = false)
  private String codapp;

  @Column(name = "s101_percod", nullable = false)
  private String percod;

  @Column(name = "n101_numcom", nullable = false)
  private String numcom;

  @Column(name = "s101_codcom", nullable = false)
  private String codcom;

  @Column(name = "s101_codfic", nullable = false)
  private String codfic;

  @Column(name = "s101_plista", nullable = false)
  private String plista;

  @Column(name = "s101_pliinf", nullable = false)
  private String pliinf;

  @Column(name = "s101_zoncli", nullable = false)
  private String zoncli;

  @Column(name = "d101_dplidc")
  private LocalDateTime dplidc;

  @Column(name = "d101_dplidd")
  private LocalDateTime dplidd;

  @Column(name = "d101_dplidt")
  private LocalDateTime dplidt;

  @Column(name = "d101_dplide")
  private LocalDateTime dplide;

  @Column(name = "d101_dplidh")
  private LocalDateTime dplidh;

  @Column(name = "n101_nbpage", nullable = false)
  private String nbpage;

  @Column(name = "n101_nbfeui", nullable = false)
  private String nbfeui;

  @Column(name = "s101_edtype", nullable = false)
  private String edtype;

  @Column(name = "n101_poipli", nullable = false)
  private String poipli;

  @Column(name = "n101_coupli", nullable = false)
  private String coupli;

  @Column(name = "n101_idtpli", nullable = false)
  private String idtpli;

  @Column(name = "s101_codpos", nullable = false)
  private String codpos;

  @Column(name = "s101_codpay", nullable = false)
  private String codpay;

  @Column(name = "s101_adres1")
  private String adres1;

  @Column(name = "s101_adres2")
  private String adres2;

  @Column(name = "s101_adres3")
  private String adres3;

  @Column(name = "s101_adres4")
  private String adres4;

  @Column(name = "s101_adres5")
  private String adres5;

  @Column(name = "s101_adres6")
  private String adres6;

  @Column(name = "s101_adres7")
  private String adres7;

  @Column(name = "s101_expad1")
  private String expad1;

  @Column(name = "s101_expad2")
  private String expad2;

  @Column(name = "s101_expad3")
  private String expad3;

  @Column(name = "s101_expad4")
  private String expad4;

  @Column(name = "s101_genpro")
  private String genpro;

  @Column(name = "s101_infcl1")
  private String infcl1;

  @Column(name = "s101_infcl2")
  private String infcl2;

  @Column(name = "d101_datdep")
  private LocalDate datdep;

  @Column(name = "n101_mspidd")
  private String mpsidd;

  @Column(name = "n101_status")
  private String status;

  @Column(name = "n101_cominf")
  private String cominf;

  @Column(name = "s101_codgam")
  private String codgam;
}
