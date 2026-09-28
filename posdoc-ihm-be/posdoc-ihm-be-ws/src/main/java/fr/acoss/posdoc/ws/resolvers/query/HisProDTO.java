package fr.acoss.posdoc.ws.resolvers.query;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class HisProDTO {

    private String codeEnv;

    private String codeOrg;

    private String codeApp;

    private String perCod;

    private String codeCom;

    private String numCom;

    private String codeFic;

    private String codeGam;

    private String proSta;

    private String proInf;

    private boolean prefec;

    private LocalDateTime dprodc;

    private LocalDateTime dprodd;

    private LocalDateTime dprodt;

    private LocalDateTime dprods;

    private LocalDateTime dprodh;

    private Integer pagFic;

    private Integer pliFic;

    private Integer rejFic;

}
