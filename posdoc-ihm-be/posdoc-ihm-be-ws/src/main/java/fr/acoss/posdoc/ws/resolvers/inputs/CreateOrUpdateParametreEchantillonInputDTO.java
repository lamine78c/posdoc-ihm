package fr.acoss.posdoc.ws.resolvers.inputs;

import fr.acoss.posdoc.types.TypeEchantillon;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateParametreEchantillonInputDTO {

  private String reference;

  private TypeEchantillon type;

  private Integer nombreLots;

  private Integer nombrePages;

  private Boolean random;

  private String formule;

}
