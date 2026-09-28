package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "repgrp")
public class GroupeEntity {

  @Id
  @Column(name = "c48_codgrp", nullable = false)
  private String code;

  @Column(name = "s48_libgrp")
  private String libelle;

  @Column(name = "s48_refenv")
  private String refEnvironnement;

  @Column(name = "s48_reforg")
  private String refOrganisme;

  @Column(name = "s48_refapp")
  private String refApplication;

  @Column(name = "s48_typgrp")
  private String typeGroupe;

}
