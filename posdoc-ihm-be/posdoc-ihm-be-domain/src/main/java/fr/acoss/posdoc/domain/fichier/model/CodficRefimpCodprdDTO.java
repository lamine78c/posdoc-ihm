package fr.acoss.posdoc.domain.fichier.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CodficRefimpCodprdDTO {
  private String codfic;
  private String refimp;
  private String codprd;
}
