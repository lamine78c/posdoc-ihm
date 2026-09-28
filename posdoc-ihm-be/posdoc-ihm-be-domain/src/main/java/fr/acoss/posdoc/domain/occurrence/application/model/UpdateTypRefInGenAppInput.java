package fr.acoss.posdoc.domain.occurrence.application.model;

import fr.acoss.posdoc.types.TypeRefection;
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
public class UpdateTypRefInGenAppInput {
    private String codEnv;
    private String codOrg;
    private String codApp;
    private String perCod;
    private TypeRefection typRef;
    private String formId;
    private String user;
}
