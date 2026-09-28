package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "lotref")
public class LotRefEntity {

  @Column(name = "C52_refenv", nullable = false)
  private String refEnvironnement;

  @Column(name = "C52_reforg", nullable = false)
  private String refOrganisation;

  @Column(name = "C52_refapp", nullable = false)
  private String refApplication;

  @Id
  @Column(name = "C52_numlot")
  private String lotNumber;

  @Column(name = "s52_typlot")
  private String type;

  @Column(name = "s52_liblot")
  private String libelle;

  @Column(name = "s52_lotapp")
  private String lotApplicatif;

  @Column(name = "S52_lotsta")
  private String statut;

  @Column(name = "d52_dlotcr")
  private LocalDate dateCreation;

  @Column(name = "d52_dlotcl")
  private LocalDate dateCloture;

  @Column(name = "d52_dlotac")
  private LocalDate dateActivation;

  @Column(name = "d52_dlotin")
  private LocalDate dateInterruption;

}
