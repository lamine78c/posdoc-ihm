package fr.acoss.posdoc.service.adelaide.impl;

import fr.acoss.posdoc.domain.message.model.IAdelaideMessage;
import fr.acoss.posdoc.exceptions.PosdocException;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocket;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.LinkedList;
import java.util.List;

@Service
public abstract class AbstractAdelaideServiceImpl<T> {

    private static final Logger LOGGER = LoggerFactory.getLogger(AbstractAdelaideServiceImpl.class);

    protected final VersionAdelaideService adelaideVersionService;
    protected final AdelaideSocketServiceImpl adelaideSocketService;

    protected AbstractAdelaideServiceImpl(final VersionAdelaideService adelaideVersionService, final AdelaideSocketServiceImpl adelaideSocketService) {
        this.adelaideVersionService = adelaideVersionService;
        this.adelaideSocketService = adelaideSocketService;
    }

    protected abstract String createMessage(final IAdelaideMessage iAdelaideMessage);

    protected abstract T logResult(final AdelaideResult result, final IAdelaideMessage iAdelaideMessage);

    public T connectAndSend(final IAdelaideMessage adelaideMessage) {
        List<IAdelaideMessage> messages = new LinkedList<>();
        messages.add(adelaideMessage);
        List<T> result = connectAndBatchSend(messages);
        return result.get(0);
    }

    public List<T> connectAndBatchSend(final List<IAdelaideMessage> adelaideMessages) {
        List<T> list = new LinkedList<>();
        AdelaideSocket adelaideSocket = null;
        try {
            adelaideSocket = adelaideSocketService.connection();
            // Send stream to server
            for (IAdelaideMessage adelaideMessage : adelaideMessages) {
                AdelaideResult adelaideResult = adelaideSocketService.sendMessage(createMessage(adelaideMessage), adelaideSocket);
                list.add(logResult(adelaideResult, adelaideMessage));
            }
        } catch (UnknownHostException e) {
            throw new PosdocException("Unknown host: " + e.getMessage());
        } catch (IOException e) {
            throw new PosdocException("IO error: " + e.getMessage());
        } finally {
            if (adelaideSocket != null) {
                adelaideSocket.getOut().close();
                try {
                    adelaideSocket.getIn().close();
                } catch (IOException e) {
                    LOGGER.error("Error for close in : {}", e.getMessage());
                }
                try {
                    adelaideSocket.getSocket().close();
                } catch (IOException ioe) {
                    LOGGER.error("Error for close socket : {}", ioe.getMessage());
                }
            }
        }
        return list;
    }

    protected static void doLogBefore(final String clazz, final String sendMessage) {
        doLogDebug(clazz, "Send message", sendMessage);
    }

    protected static void doLogAfter(final String clazz, final String errorMessage) {
        doLogDebug(clazz, "Error message", errorMessage);
    }

    private static void doLogDebug(final String methodName, final String labelMessage, final String message) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("****** {} -> {} : {}", methodName, labelMessage, message);
        }
    }
}