package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "genpro")
public class GenProEntity {

  @EmbeddedId
  private GenProCompositeId id;

  @Column(name = "s16_prosta", nullable = false)
  private String proSta;

  @Column(name = "s16_proinf", nullable = false)
  private String proInf;

  @Column(name = "b16_prefec", nullable = false)
  private boolean prefec;

  @Column(name = "d16_dprodc", nullable = false)
  private LocalDateTime dprodc;

  @Column(name = "d16_dprodd", nullable = false)
  private LocalDateTime dprodd;

  @Column(name = "d16_dprodt", nullable = false)
  private LocalDateTime dprodt;

  @Column(name = "d16_dprods", nullable = false)
  private LocalDateTime dprods;

  @Column(name = "d16_dprodh", nullable = false)
  private LocalDateTime dprodh;

  @Column(name = "n16_pagfic", nullable = false)
  private Integer pagFic;

  @Column(name = "n16_plific", nullable = false)
  private Integer pliFic;

  @Column(name = "n16_rejfic", nullable = false)
  private Integer rejFic;
}
