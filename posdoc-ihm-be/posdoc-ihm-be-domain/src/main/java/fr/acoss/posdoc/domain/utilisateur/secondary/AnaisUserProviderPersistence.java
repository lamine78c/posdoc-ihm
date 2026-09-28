package fr.acoss.posdoc.domain.utilisateur.secondary;

import fr.acoss.posdoc.domain.utilisateur.model.AnaisUser;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface AnaisUserProviderPersistence {

    Optional<AnaisUser> getUserInfo(String uid);

    String getUserFullName(String uid);

    /**
     * Récupère les noms complets de plusieurs utilisateurs en un seul appel
     *
     * @param uids Liste des identifiants utilisateur
     * @return Map avec uid en clé et nom complet en valeur (ou uid si non trouvé)
     */
    Map<String, String> getUsersFullNames(List<String> uids);
}
