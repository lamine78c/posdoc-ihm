package fr.acoss.posdoc.domain.utilisateur.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.utilisateur.model.Utilisateur;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface UtilisateurPersistence {

    Paginated<Utilisateur> select(QueryParameters queryParameters);

    Utilisateur create(Utilisateur utilisateur);

    Utilisateur update(Utilisateur utilisateur);

    void delete(final String codeUtilisateur);

    boolean exists(final String codeUtilisateur);

    void deleteAll(List<String> ids);

    List<Utilisateur> updateAll(List<Utilisateur> utilisateurs);
}
