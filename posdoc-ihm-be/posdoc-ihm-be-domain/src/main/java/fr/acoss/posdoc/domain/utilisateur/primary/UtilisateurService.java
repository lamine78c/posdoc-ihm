package fr.acoss.posdoc.domain.utilisateur.primary;

import fr.acoss.posdoc.domain.utilisateur.model.Utilisateur;
import fr.acoss.posdoc.domain.utilisateur.secondary.UtilisateurPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import java.util.List;

public class UtilisateurService {

    private final UtilisateurPersistence utilisateurPersistence;

    public UtilisateurService(final UtilisateurPersistence utilisateurPersistence) {
        this.utilisateurPersistence = utilisateurPersistence;
    }

    public Utilisateur createUtilisateur(final Utilisateur utilisateur) {
        if (utilisateurPersistence.exists(utilisateur.getCodeUtilisateur())) {
            throw new AlreadyExistingElement("Utilisateur", utilisateur.getCodeUtilisateur());
        }

        return utilisateurPersistence.create(utilisateur);
    }

    public Utilisateur updateUtilisateur(final Utilisateur utilisateur) {
        if (!utilisateurPersistence.exists(utilisateur.getCodeUtilisateur())) {
            throw new ElementNotFoundException("Utilisateur", utilisateur.getCodeUtilisateur());
        }
        return utilisateurPersistence.create(utilisateur);
    }

    public void deleteUtilisateur(final String code) {
        utilisateurPersistence.delete(code);
    }

    public void deleteUtilisateurs(List<String> ids) {
        utilisateurPersistence.deleteAll(ids);
    }

    public List<Utilisateur> updateUtilisateurs(List<Utilisateur> utilisateurs) {
        return utilisateurPersistence.updateAll(utilisateurs);
    }
}
