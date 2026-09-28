package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateAdresseRetourPayloadDTO {

    private String code;

    private String codeOrganisme;

    private String adresse1;

    private String adresse2;

    private String adresse3;

    private String adresse4;

    private Boolean isNotAuthorisedToBeDeleted;

    private List<CreateOrUpdateFichierPayloadDTO> fichiers;

}
