package fr.acoss.posdoc.domain.parametre.echantillon.model;

import fr.acoss.posdoc.types.TypeEchantillon;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ParametreEchantillon {

  private String reference;

  private TypeEchantillon type;

  private Integer nombreLots;

  private Integer nombrePages;

  private Boolean random;

  private String formule;

  private Boolean isNotAuthorisedToBeDeleted;

}
