package fr.acoss.posdoc.domain.contenu.primary;

import fr.acoss.posdoc.domain.contenu.model.Contenu;
import fr.acoss.posdoc.domain.contenu.secondary.ContenuPersistence;

public class ContenuService {

    private ContenuPersistence contenuPersistence;

    public ContenuService(
            final ContenuPersistence contenuPersistence
    ) {
        this.contenuPersistence = contenuPersistence;
    }

    public Contenu createContenu(final Contenu contenu) {

        return contenuPersistence.create(contenu);
    }

    public void deleteContrenu(final Integer id) {
        contenuPersistence.delete(id);
    }
}
