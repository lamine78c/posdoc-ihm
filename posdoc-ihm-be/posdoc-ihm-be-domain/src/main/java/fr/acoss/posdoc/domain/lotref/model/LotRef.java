package fr.acoss.posdoc.domain.lotref.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class LotRef {


  private String refEnvironnement;

  private String refOrganisation;

  private String refApplication;

  private String lotNumber;

  private String type;

  private String libelle;

  private String lotApplicatif;

  private String statut;

  private LocalDate dateCreation;

  private LocalDate dateCloture;

  private LocalDate dateActivation;

  private LocalDate dateInterruption;

}
