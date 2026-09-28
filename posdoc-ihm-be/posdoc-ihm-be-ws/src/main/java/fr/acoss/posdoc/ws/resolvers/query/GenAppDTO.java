package fr.acoss.posdoc.ws.resolvers.query;

import fr.acoss.posdoc.types.TypeRefection;
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
public class GenAppDTO {

    private String codeEnv;

    private String codeOrg;

    private String codeApp;

    private String perCod;

    private String appsta;

    private String appinf;

    private Boolean arefec;

    private LocalDateTime dapplc;

    private LocalDateTime dappld;

    private LocalDateTime dapplt;

    private LocalDateTime dappls;

    private LocalDateTime dapplh;

    private TypeRefection typref;

    private Boolean manuel;

    private String sitori;

}
