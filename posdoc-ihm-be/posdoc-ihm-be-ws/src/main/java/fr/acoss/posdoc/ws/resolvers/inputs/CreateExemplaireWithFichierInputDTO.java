package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateExemplaireWithFichierInputDTO {

    private String codeRessource;

    private String codeGamme;

    private String codeSite;
}
