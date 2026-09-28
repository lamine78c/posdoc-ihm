package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.message.model.GenericAdelaideMessage;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import fr.acoss.posdoc.service.adelaide.impl.GenericMessageAdelaideServiceImpl;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class OccurrenceApplicationServiceTest extends AbstractGraphqlTest {

    private final GenericMessageAdelaideServiceImpl genericMessageAdelaideService;

    @Autowired
    public OccurrenceApplicationServiceTest(final GenericMessageAdelaideServiceImpl genericMessageAdelaideService) {
        this.genericMessageAdelaideService = genericMessageAdelaideService;
    }

    @Disabled("Test désactivé : nécessite un mock du service Adelaide avant réactivation")
    @Test
    void get_signal_s01() {
        String message = AdelaideUtil. FONC_GET_SIGNAL_S01 + AdelaideUtil.CAR_FIN;
        GenericAdelaideMessage genericAdelaideMessage = new GenericAdelaideMessage(message);
        AdelaideResult retour = this.genericMessageAdelaideService.sendGenericMessage(genericAdelaideMessage);
        assertNotNull(retour);
        assertNull(retour.getError());
    }

}


