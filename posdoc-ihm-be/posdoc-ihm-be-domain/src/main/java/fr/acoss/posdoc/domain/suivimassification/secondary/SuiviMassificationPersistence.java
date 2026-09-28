package fr.acoss.posdoc.domain.suivimassification.secondary;

import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationFiltreDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationPayload;

import java.util.List;

public interface SuiviMassificationPersistence {

    List<SuiviMassificationFiltreDTO> getDistinctFiltreMassification();

    List<SuiviMassificationDTO> searchForSuiviMassification(SuiviMassificationPayload payload);

    Integer searchCountForSuiviMassification(SuiviMassificationPayload payload);
}
