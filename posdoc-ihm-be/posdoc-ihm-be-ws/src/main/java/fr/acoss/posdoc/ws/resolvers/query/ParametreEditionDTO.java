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
public class ParametreEditionDTO {

    private String reference;

    private String type;

    private String libelle;

    private Integer lineNumber;

    private Integer columnNumber;

    private Integer length;

}
