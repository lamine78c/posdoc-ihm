package fr.acoss.posdoc.domain.genfic.model;

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
public class OccurenceApplication {
    private String codEnv;
    private String codOrg;
    private String codApp;
    private String perCod;
    private String appsta;
    private LocalDateTime dapplc;
    private LocalDateTime dappld;
    private LocalDateTime dapplt;
    private String codSit;
}
