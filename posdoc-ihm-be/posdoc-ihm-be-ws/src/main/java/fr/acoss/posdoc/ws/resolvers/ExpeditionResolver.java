package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.expedition.model.ExpeditionPayloadDTO;
import fr.acoss.posdoc.domain.expedition.model.SearchExpeditionQuery;
import fr.acoss.posdoc.domain.expedition.secondary.ExpeditionPersistence;
import org.springframework.stereotype.Component;

@Component
public class ExpeditionResolver extends AbstractQueryResolver {

  private final ExpeditionPersistence expeditionPersistence;

  public ExpeditionResolver(ExpeditionPersistence expeditionPersistence) {
    this.expeditionPersistence = expeditionPersistence;
  }

  public ExpeditionPayloadDTO getExpeditions(SearchExpeditionQuery query) {
    return expeditionPersistence.findExpeditions(query);
  }

}
