package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class TarposPayloadDto {
    private String type;
    private String libelle;
    private Integer ordre;
    private Boolean tlibre;
    private Boolean compta;
    private Boolean perime;
}
