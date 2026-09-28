package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.domain.message.model.GenericAdelaideMessage;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;

public interface GenericMessageAdelaideService {

    AdelaideResult sendGenericMessage(GenericAdelaideMessage genericAdelaideMessage);
}
