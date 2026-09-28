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
public class DocVideoPayloadDTO {
    private String datdem;
    private String numdem;
    private String coddoc;
    private String refdem;
    private String typact;
    private Boolean imprim;
    private String docsta;
}
