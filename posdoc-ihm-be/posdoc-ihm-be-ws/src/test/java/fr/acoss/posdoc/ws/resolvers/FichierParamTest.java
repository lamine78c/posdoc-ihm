package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.fichier.model.CodComCodDocLibFicInFichier;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"/sql/fichier/insert-fichier-param.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"/sql/fichier/clean-fichier-param.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class FichierParamTest extends AbstractGraphqlTest {
    @Test
    void find_com_doc_libfic_in_fichier() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/find-com-doc-libfic-in-fichier.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(2, response.getList("$.data.findComDocLibFicInFichier", CodComCodDocLibFicInFichier.class).size());
    }
}
