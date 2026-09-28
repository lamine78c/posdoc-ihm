package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTarifDTO {

  private String type;

  private String numero;

  private LocalDate dateDebut;

  private LocalDate dateFin;

  private Double coutPli;

  private Boolean urgent;

}
