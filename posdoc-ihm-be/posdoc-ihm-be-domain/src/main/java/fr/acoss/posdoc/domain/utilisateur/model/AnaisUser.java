package fr.acoss.posdoc.domain.utilisateur.model;

import lombok.*;

/**
 * Modèle métier représentant un utilisateur Anais
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnaisUser {

    private String uid;

    private String nom;

    private String prenom;

    private String mail;

    private String telephone;

    private String etablissement;

    public String getFullNameUid() {
        return prenom + " " + nom + " (" + uid + ")";
    }
}
