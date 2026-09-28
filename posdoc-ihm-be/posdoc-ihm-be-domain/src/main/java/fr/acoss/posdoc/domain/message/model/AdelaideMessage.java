package fr.acoss.posdoc.domain.message.model;

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
public class AdelaideMessage implements IAdelaideMessage {
    private String codEnv;
    private String codOrg;
    private String codApp;
    private String perCod;
    private String formId;
    private String user;
}
