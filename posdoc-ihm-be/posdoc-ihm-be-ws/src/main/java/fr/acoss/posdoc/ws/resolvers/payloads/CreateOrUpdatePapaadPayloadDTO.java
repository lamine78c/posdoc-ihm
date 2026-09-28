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
public class CreateOrUpdatePapaadPayloadDTO {

    private String codeCommande;

    private String codeFichier;

    private String codeNotif;

    private String libelle;

    private Boolean periode;

    private String codeRND;

    private String appPro;

    private String typeHas;

    private String format;

    private String isUrib;

    private Boolean nsTruc;

    private Boolean imprime;

    private Boolean huissier;

    private Boolean numNot;

    private Boolean strRaf;

    private Boolean contrat;

    private Boolean medele;

    private Boolean idtbcc;

}
