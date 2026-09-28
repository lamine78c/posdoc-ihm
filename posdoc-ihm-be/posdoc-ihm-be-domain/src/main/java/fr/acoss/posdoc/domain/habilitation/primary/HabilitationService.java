package fr.acoss.posdoc.domain.habilitation.primary;


import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import fr.acoss.posdoc.domain.habilitation.secondary.HabilitationPersistence;

import java.util.List;

public class HabilitationService {

    private final HabilitationPersistence habilitationPersistence;

    public HabilitationService(final HabilitationPersistence habilitationPersistence) {
        this.habilitationPersistence = habilitationPersistence;
    }

    public void deleteHabilitations(Iterable<String> ids) {
        habilitationPersistence.deleteAll(ids);
    }

    public List<Habilitation> updateHabilitations(List<Habilitation> habilitations) {
        return habilitationPersistence.updateAll(habilitations);
    }

    public List<Habilitation> createHabilitations(List<Habilitation> habilitations) {
        return habilitationPersistence.updateAll(habilitations);
    }
}
