package fr.acoss.posdoc.domain.tarif.model;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Tarif {

  private String type;

  private String numero;

  private LocalDate dateDebut;

  private LocalDate dateFin;

  private Double coutPli;

  private Boolean urgent;

}
