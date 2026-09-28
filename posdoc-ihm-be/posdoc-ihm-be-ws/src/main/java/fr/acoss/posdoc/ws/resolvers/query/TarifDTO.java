package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class TarifDTO {

  private String type;

  private String numero;

  private LocalDate dateDebut;

  private LocalDate dateFin;

  private Double coutPli;

  private Boolean urgent;

}
