package fr.acoss.posdoc.ws.resolvers.payloads;

import fr.acoss.posdoc.domain.utilog.model.UtiLog;
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
public class MassificationResultPayloadDTO {

    private UtiLog utiLog;
    private String pdfBase64;
}
