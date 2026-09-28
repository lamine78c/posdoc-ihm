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

class GenericMessageAdelaideTest extends AbstractGraphqlTest {

    private final GenericMessageAdelaideServiceImpl genericMessageAdelaideService;

    @Autowired
    public GenericMessageAdelaideTest(final GenericMessageAdelaideServiceImpl genericMessageAdelaideService) {
        this.genericMessageAdelaideService = genericMessageAdelaideService;
    }

    /**
     * Exemple d'utilisation d'un outil pour tester les échanges de messages avec adélaïde.
     * Pour l'utiliser, l'idée est de créer un GénéricAdelaideMessage et de l'envoyer à adélaïde pour tester les échanges.
     * L'objet AdelaideResult contiendra le résultat dans la propriété  "result" et les erreurs dans la propriété "error"
     * Cette exemple ça permet de lire le contenu du fichier /adldatas/temp/req4fab.txt
     * Le test a été désactivé pour éviter d'être lancé à chaque construction du projet
     */
    @Disabled("Outil de test manuel désactivé : nécessite un environnement Adelaide configuré, à activer manuellement si besoin")
    @Test
    void tools_send_message() {
        String message = "8/adldatas/temp/req4fab.txt" + AdelaideUtil.CAR_CHAMP;
        GenericAdelaideMessage genericAdelaideMessage = new GenericAdelaideMessage(message + AdelaideUtil.CAR_FIN);
        AdelaideResult retour = this.genericMessageAdelaideService.sendGenericMessage(genericAdelaideMessage);
        assertNotNull(retour);
        assertNull(retour.getError());
    }

}


