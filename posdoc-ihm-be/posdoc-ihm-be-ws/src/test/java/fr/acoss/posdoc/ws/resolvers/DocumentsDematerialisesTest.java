package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.gendoc.model.DocDemOccurrenceApplication;
import fr.acoss.posdoc.domain.gendoc.model.GenDocOrgAppCom;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemOccurrenceApplicationQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemQuery;
import fr.acoss.posdoc.types.Constantes;
import fr.acoss.posdoc.ws.resolvers.payloads.DocDematerialisePayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/documents-dematerialises/insert-documents-dematerialises.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/documents-dematerialises/clean-documents-dematerialises.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class DocumentsDematerialisesTest extends AbstractGraphqlTest {

    @Test
    void get_docs_dematerialises_ok() throws IOException {
        final var variables= new ObjectMapper().createObjectNode();
        SearchDocDemQuery query = new SearchDocDemQuery();
        query.setDate("2025-07-01");
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/documents-dematerialises/documents-dematerialises.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<DocDematerialisePayloadDTO> responseList = response.getList("$.data.getDocsDematerialises", DocDematerialisePayloadDTO.class);
        assertEquals(4, responseList.size());
    }

    @Test
    void getDocDemOccurrenceApplication_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(this.getQuery("P", "117", "SNV2", "251031-00", "AD04", "L00", "00")));

        final var response = graphQLTestTemplate.perform("graphql-requests/documents-dematerialises/doc-dem-occurrence-application.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<DocDemOccurrenceApplication> responseList = response.getList("$.data.getDocDemOccurrenceApplication", DocDemOccurrenceApplication.class);

        assertEquals(1, responseList.size());
        assertEquals("RSCAE", responseList.get(0).getCoddoc());
        assertEquals(Constantes.TYPES.get("0"), responseList.get(0).getTypact());
    }

    private SearchDocDemOccurrenceApplicationQuery getQuery(String codenv, String codorg, String codapp, String percod, String codcom, String codfic, String numcom) {
        SearchDocDemOccurrenceApplicationQuery query = new SearchDocDemOccurrenceApplicationQuery();
        query.setCodenv(codenv);
        query.setCodorg(codorg);
        query.setCodapp(codapp);
        query.setPercod(percod);
        query.setCodcom(codcom);
        query.setCodfic(codfic);
        query.setNumcom(numcom);

        return query;
    }

    @Test
    void get_distinct_org_app_com_from_gendoc() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/documents-dematerialises/get-distinct-org-app-com-from-gendoc.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(4, response.getList("$.data.getDistinctOrgAppComFromGendoc", GenDocOrgAppCom.class).size());
    }
}
