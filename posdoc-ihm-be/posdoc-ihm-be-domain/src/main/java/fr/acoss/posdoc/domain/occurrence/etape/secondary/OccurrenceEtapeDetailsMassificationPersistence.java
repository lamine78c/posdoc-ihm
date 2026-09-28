package fr.acoss.posdoc.domain.occurrence.etape.secondary;

import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationOccurrenceEtape;
import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationPayload;

import java.util.List;

public interface OccurrenceEtapeDetailsMassificationPersistence {

    List<DetailsMassificationOccurrenceEtape> findDetailsMassificationForOccurrenceEtape(DetailsMassificationPayload payload);
}
