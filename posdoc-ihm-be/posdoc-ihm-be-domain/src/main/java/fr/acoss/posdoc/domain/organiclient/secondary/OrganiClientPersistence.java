package fr.acoss.posdoc.domain.organiclient.secondary;


import fr.acoss.posdoc.domain.organiclient.model.OrganiClient;

import java.util.List;

public interface OrganiClientPersistence {
    List<OrganiClient> findAll();
}
