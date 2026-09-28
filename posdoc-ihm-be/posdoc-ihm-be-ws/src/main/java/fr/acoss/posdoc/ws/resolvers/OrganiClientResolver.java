package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.organiclient.model.OrganiClient;
import fr.acoss.posdoc.domain.organiclient.secondary.OrganiClientPersistence;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrganiClientResolver extends AbstractQueryResolver {
  private final OrganiClientPersistence organiClientPersistence;

  public OrganiClientResolver(final OrganiClientPersistence organiClientPersistence) {
    this.organiClientPersistence = organiClientPersistence;
  }

  public List<OrganiClient> findAllOrganiClient() {
    return organiClientPersistence.findAll();
  }
}
