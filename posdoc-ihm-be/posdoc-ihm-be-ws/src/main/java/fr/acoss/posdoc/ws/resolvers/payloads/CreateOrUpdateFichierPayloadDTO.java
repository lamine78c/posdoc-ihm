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
public class CreateOrUpdateFichierPayloadDTO {

    private String codeEnv;

    private String codeOrg;

    private String codeApp;

    private String codeCom;

    private String codeFich;

    private String libFichier;

    private String refImprime;

    private String codeAdr;

    private String codeProd;

    private String refFormat;

    private String typeFormat;

    private Integer page;

    private String codeClient;

    private String typeSig;

    private String typeMultif;

    private String typeSupport;

    private String refSupport;

    private Integer eclatement;

    private String codeDocument;

    private Boolean isNotAuthorisedToBeDeleted;


}
