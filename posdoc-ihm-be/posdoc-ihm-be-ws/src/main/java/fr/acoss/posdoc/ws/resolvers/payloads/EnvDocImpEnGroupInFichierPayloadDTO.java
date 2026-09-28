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
public class EnvDocImpEnGroupInFichierPayloadDTO {
    private String codeDoc;
    private String codeEnv;
}
