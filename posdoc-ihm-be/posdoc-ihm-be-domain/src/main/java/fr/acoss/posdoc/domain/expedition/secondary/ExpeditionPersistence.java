package fr.acoss.posdoc.domain.expedition.secondary;

import fr.acoss.posdoc.domain.expedition.model.ExpeditionPayloadDTO;
import fr.acoss.posdoc.domain.expedition.model.SearchExpeditionQuery;

public interface ExpeditionPersistence {
  ExpeditionPayloadDTO findExpeditions(SearchExpeditionQuery query);
}