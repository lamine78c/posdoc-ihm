package fr.acoss.posdoc.domain.occurrence.application.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class OngletsParamDataInput {
    private String codEnv;
    private String codOrg;
    private String codApp;
    private String perCod;
}
