package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.occurrence.etape.model.ScriptPayload;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OccurrenceEtapeScriptTest extends AbstractGraphqlTest {


    @Disabled("Test désactivé : nécessite de mocker les dépendances externes avant activation")
    @Test
    void consulteScriptEtape() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("scriptPayload", new ObjectMapper().valueToTree(
                ScriptPayload.builder()
                        .script("/adldatas/tmp/t_117_snv2_241105-00/divers/s02_00_es10_l00.sh")
                        .build()
        ));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/consulte-script-etape.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        AdelaideResult result = response.get("$.data.consulteScriptEtape", AdelaideResult.class);
        assertNotNull(result.getResult());
    }
}