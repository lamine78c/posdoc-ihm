package fr.acoss.posdoc.service.adelaide.impl;

import fr.acoss.posdoc.domain.message.model.GenericAdelaideMessage;
import fr.acoss.posdoc.domain.message.model.IAdelaideMessage;
import fr.acoss.posdoc.service.adelaide.GenericMessageAdelaideService;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class GenericMessageAdelaideServiceImpl extends AbstractAdelaideServiceImpl<AdelaideResult> implements GenericMessageAdelaideService {

    private static final Logger LOGGER = LoggerFactory.getLogger(GenericMessageAdelaideServiceImpl.class);

    public GenericMessageAdelaideServiceImpl(
            final VersionAdelaideService adelaideVersionService,
            final AdelaideSocketServiceImpl adelaideSocketService) {
        super(adelaideVersionService, adelaideSocketService);

    }

    @Override
    protected String createMessage(final IAdelaideMessage iAdelaideMessage) {
        GenericAdelaideMessage genericAdelaideMessage = (GenericAdelaideMessage) iAdelaideMessage;
        return genericAdelaideMessage.getMessage();
    }

    @Override
    protected AdelaideResult logResult(final AdelaideResult result, final IAdelaideMessage iAdelaideMessage) {
        LOGGER.info("Error {}", result.getError());
        LOGGER.info("Result {}", result);
        return result;
    }

    @Override
    public AdelaideResult sendGenericMessage(final GenericAdelaideMessage genericAdelaideMessage) {
        return this.connectAndSend(genericAdelaideMessage);
    }
}
