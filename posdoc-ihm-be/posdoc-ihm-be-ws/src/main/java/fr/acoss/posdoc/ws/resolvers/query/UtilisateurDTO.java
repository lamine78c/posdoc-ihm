package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class UtilisateurDTO {

    private String codeUtilisateur;

    private String libelleUtilisateur;

    private String profile;

    private String password;

    private Boolean actif ;

    private String codeEnvironnement;

    private String codeSite;
}
