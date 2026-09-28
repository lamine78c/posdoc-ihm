package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationFiltreDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationPayload;
import fr.acoss.posdoc.domain.suivimassification.secondary.SuiviMassificationPersistence;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SuiviMassificationResolver extends AbstractQueryResolver {

    private final SuiviMassificationPersistence suiviMassificationPersistence;

    public SuiviMassificationResolver(
            final SuiviMassificationPersistence persistence
    ) {
        this.suiviMassificationPersistence = persistence;
    }

    public List<SuiviMassificationFiltreDTO> getDistinctFiltreMassification() {
        return this.suiviMassificationPersistence.getDistinctFiltreMassification();
    }

    public List<SuiviMassificationDTO> searchForSuiviMassification(SuiviMassificationPayload payload) {
        return this.suiviMassificationPersistence.searchForSuiviMassification(payload);
    }

    public Integer searchCountForSuiviMassification(SuiviMassificationPayload payload) {
        return this.suiviMassificationPersistence.searchCountForSuiviMassification(payload);
    }
}
