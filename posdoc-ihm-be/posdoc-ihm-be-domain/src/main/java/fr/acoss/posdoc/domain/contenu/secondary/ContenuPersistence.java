package fr.acoss.posdoc.domain.contenu.secondary;

import fr.acoss.posdoc.domain.contenu.model.Contenu;
import fr.acoss.posdoc.domain.contenu.model.ContenuForAccueil;

import java.util.List;

public interface ContenuPersistence {

    List<Contenu> selectAll();

    Contenu create(Contenu contenu);

    void delete(Integer code);

    List<ContenuForAccueil> getContenusForAccueil(List<String> userOrganismes);
}
