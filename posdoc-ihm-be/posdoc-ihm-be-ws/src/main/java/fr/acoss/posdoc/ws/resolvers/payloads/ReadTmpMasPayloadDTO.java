package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ReadTmpMasPayloadDTO {
    private String codenv;
    private String codorg;
    private String codapp;
    private String codcom;
    private String codfic;
    private String codcli;
    private String percod;
    private String masuti;
    private String codsit;
}