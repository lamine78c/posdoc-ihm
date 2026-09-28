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
@Table(name = "hispro")
public class HisProEntity {

  @EmbeddedId
  private HisProCompositeId id;

  @Column(name = "s23_prosta", nullable = false)
  private String proSta;

  @Column(name = "s23_proinf", nullable = false)
  private String proInf;

  @Column(name = "b23_prefec", nullable = false)
  private boolean prefec;

  @Column(name = "d23_dprodc", nullable = false)
  private LocalDateTime dprodc;

  @Column(name = "d23_dprodd", nullable = false)
  private LocalDateTime dprodd;

  @Column(name = "d23_dprodt", nullable = false)
  private LocalDateTime dprodt;

  @Column(name = "d23_dprods", nullable = false)
  private LocalDateTime dprods;

  @Column(name = "d23_dprodh", nullable = false)
  private LocalDateTime dprodh;

  @Column(name = "n23_pagfic", nullable = false)
  private Integer pagFic;

  @Column(name = "n23_plific", nullable = false)
  private Integer pliFic;

  @Column(name = "n23_rejfic", nullable = false)
  private Integer rejFic;
}
