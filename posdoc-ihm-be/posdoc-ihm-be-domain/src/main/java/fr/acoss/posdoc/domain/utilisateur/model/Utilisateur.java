package fr.acoss.posdoc.domain.utilisateur.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Utilisateur {

    private String codeUtilisateur;

    private String libelleUtilisateur;

    private String profile;

    private String password;

    private Integer actif ;

    private String codeEnvironnement;

    private String codeSite;
}
