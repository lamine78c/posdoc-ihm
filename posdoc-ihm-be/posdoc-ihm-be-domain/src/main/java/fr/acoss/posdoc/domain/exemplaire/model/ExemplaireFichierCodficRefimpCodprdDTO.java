package fr.acoss.posdoc.domain.exemplaire.model;

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
public class ExemplaireFichierCodficRefimpCodprdDTO {
  private String codfic;
  private String refImprime;
  private String codeProd;
}
