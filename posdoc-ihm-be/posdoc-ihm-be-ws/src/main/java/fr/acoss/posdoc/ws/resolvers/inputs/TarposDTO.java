package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class TarposDTO {
    private String type;
    private String libelle;
    private Integer ordre;
    private Boolean tlibre;
    private Boolean compta;
    private Boolean perime;
}
