package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateFichierWithExemplairePayloadDTO {

    private Integer nbFichiers;

    private Integer nbProduits;

    private Integer nbExemplaires;

}
