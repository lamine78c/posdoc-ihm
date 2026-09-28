package fr.acoss.posdoc.ws.resolvers.query;

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
public class AdresseRetourDTO {

    private String code;

    private String codeOrganisme;

    private String adresse1;

    private String adresse2;

    private String adresse3;

    private String adresse4;

}
