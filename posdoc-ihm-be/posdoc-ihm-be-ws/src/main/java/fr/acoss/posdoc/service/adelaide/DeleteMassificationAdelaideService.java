package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;

import java.util.List;

public interface DeleteMassificationAdelaideService {

    AdelaideResult delete(List<MassificationSearch> list );
}
