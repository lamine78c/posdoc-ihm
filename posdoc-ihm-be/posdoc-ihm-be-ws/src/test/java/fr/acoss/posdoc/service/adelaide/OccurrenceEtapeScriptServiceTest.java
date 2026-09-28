package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.message.model.GenericAdelaideMessage;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import fr.acoss.posdoc.service.adelaide.impl.GenericMessageAdelaideServiceImpl;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class OccurrenceEtapeScriptServiceTest extends AbstractGraphqlTest {

    private final GenericMessageAdelaideServiceImpl genericMessageAdelaideService;

    @Autowired
    public OccurrenceEtapeScriptServiceTest(final GenericMessageAdelaideServiceImpl genericMessageAdelaideService) {
        this.genericMessageAdelaideService = genericMessageAdelaideService;
    }

    @Disabled("Test désactivé : nécessite un mock du service Adelaide avant réactivation")
    @Test
    void testFoncGetFichierAdelaide() {
        String message = AdelaideUtil. FONC_GET_FICHIER + AdelaideUtil.CAR_CHAMP + "0" + AdelaideUtil.CAR_FIN;
        GenericAdelaideMessage genericAdelaideMessage = new GenericAdelaideMessage(message);
        AdelaideResult retour = this.genericMessageAdelaideService.sendGenericMessage(genericAdelaideMessage);
        assertNotNull(retour);
        assertEquals("Fichier  absent", retour.getError());
    }

}


