package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.AbstractGraphqlTest;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VersionTest  extends AbstractGraphqlTest {

    @Test
    void test_get_version() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/version/select-version.graphql");
        String result = response.get("$.data.getVersion");
        assertTrue(!result.isEmpty(),"Vesrion not vide");

    }
}
