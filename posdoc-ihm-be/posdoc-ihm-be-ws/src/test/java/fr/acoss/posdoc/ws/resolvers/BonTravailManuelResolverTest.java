package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailInput;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.model.SearchBonTravailManuelQuery;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeDTO;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelDTO;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelNoticesPayload;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelPayload;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/bon-travail/insert-bon-travail-manuel.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/bon-travail/clean-bon-travail-manuel.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class BonTravailManuelResolverTest extends AbstractGraphqlTest {

    @BeforeEach
    void setUp() {
        Context context = new Context();
        context.setUser("testUser");
        context.setHost("127.0.0.1");
        ContextHolder.setContext(context);
    }

    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Test
    void searchBonTravailManuel_withValidInput_returnData() throws Exception {
        final var variables = createObjectMapper().createObjectNode();
        variables.set("searchBonTravailManuelQuery", createObjectMapper().valueToTree(
                createSearchQuery("T", "750", "SNV2", "MANU", "M01")
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/search-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<BonTravailGroupByPeriodeDTO> result = response.getList("$.data.searchBonTravailManuel", BonTravailGroupByPeriodeDTO.class);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("MANU", result.get(0).getCodcom());
        assertEquals("SNV2", result.get(0).getCodapp());
        assertEquals("M01", result.get(0).getCodfic());
    }

    @Test
    void searchBonTravailManuel_withCodcomFilter_returnFilteredData() throws Exception {
        ObjectMapper mapper = createObjectMapper();
        final var variables = mapper.createObjectNode();
        variables.set("searchBonTravailManuelQuery", mapper.valueToTree(
                createSearchQuery("T", "750", "SNV2", "MANU", "M01")
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/search-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<BonTravailGroupByPeriodeDTO> result = response.getList("$.data.searchBonTravailManuel", BonTravailGroupByPeriodeDTO.class);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("M01", result.get(0).getCodfic());
    }

    @Test
    void searchBonTravailManuel_withDifferentCodeApp_returnCorrectData() throws Exception {
        ObjectMapper mapper = createObjectMapper();
        final var variables = mapper.createObjectNode();
        variables.set("searchBonTravailManuelQuery", mapper.valueToTree(
                createSearchQuery("T", "750", "CNAV", "MANU", "C01")
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/search-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<BonTravailGroupByPeriodeDTO> result = response.getList("$.data.searchBonTravailManuel", BonTravailGroupByPeriodeDTO.class);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("CNAV", result.get(0).getCodapp());
        assertEquals("C01", result.get(0).getCodfic());
    }

    @Test
    void deleteBonTravailManuel_withValidInput_returnSuccess() throws Exception {
        ObjectMapper mapper = createObjectMapper();
        final var variables = mapper.createObjectNode();
        variables.set("query", mapper.valueToTree(
                createDeleteQuery("T", "750", "SNV2", "240523-00", "MANU", "M01", "01")
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/delete-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        DeletePayloadDTO result = response.get("$.data.deleteBonTravailManuel", DeletePayloadDTO.class);

        assertNotNull(result);
        assertTrue(result.getOk());
    }

    @Test
    void createBonTravailManuel_withValidInput_returnCreatedData() throws Exception {
        ObjectMapper mapper = createObjectMapper();
        final var variables = mapper.createObjectNode();
        variables.set("payload", mapper.valueToTree(
                createBonTravailManuelPayload(false, "T", "750", "SNV2", "240523-00", "NEW1", "03", "M03")
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/create-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateBonTravailManuelDTO result = response.get("$.data.createBonTravailManuel", CreateOrUpdateBonTravailManuelDTO.class);

        assertNotNull(result);
        assertEquals("T", result.getCodenv());
        assertEquals("750", result.getCodorg());
        assertEquals("SNV2", result.getCodapp());
        assertNotNull(result.getPercod());
        assertTrue(result.getPercod().matches("\\d{6}-M0"));
        assertEquals("NEW1", result.getCodcom());
        assertEquals("03", result.getNumcom());
        assertEquals("M03", result.getCodfic());
    }

    @Test
    void createBonTravailManuel_withNotices_returnCreatedDataWithNotices() throws Exception {
        ObjectMapper mapper = createObjectMapper();
        final var variables = mapper.createObjectNode();
        CreateOrUpdateBonTravailManuelPayload payload = createBonTravailManuelPayload(
                false, "T", "750", "SNV2", "240523-00", "NEW2", "04", "M04"
        );

        CreateOrUpdateBonTravailManuelNoticesPayload notice1 = new CreateOrUpdateBonTravailManuelNoticesPayload();
        notice1.setCodnot("NOTICE1");
        notice1.setPoinot(new BigDecimal("1"));

        CreateOrUpdateBonTravailManuelNoticesPayload notice2 = new CreateOrUpdateBonTravailManuelNoticesPayload();
        notice2.setCodnot("NOTICE2");
        notice2.setPoinot(new BigDecimal("2"));

        payload.setNotices(List.of(notice1, notice2));

        variables.set("payload", mapper.valueToTree(payload));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/create-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateBonTravailManuelDTO result = response.get("$.data.createBonTravailManuel", CreateOrUpdateBonTravailManuelDTO.class);

        assertNotNull(result);
        assertEquals("NEW2", result.getCodcom());
    }

    @Test
    void updateBonTravailManuel_withValidInput_returnUpdatedData() throws Exception {
        ObjectMapper mapper = createObjectMapper();
        final var variables = mapper.createObjectNode();
        variables.set("payload", mapper.valueToTree(
                createBonTravailManuelPayload(true, "T", "750", "SNV2", "240523-00", "MANU", "01", "M01")
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/update-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateBonTravailManuelDTO result = response.get("$.data.updateBonTravailManuel", CreateOrUpdateBonTravailManuelDTO.class);

        assertNotNull(result);
        assertEquals("T", result.getCodenv());
        assertEquals("750", result.getCodorg());
        assertEquals("SNV2", result.getCodapp());
        assertEquals("240523-00", result.getPercod());
        assertEquals("MANU", result.getCodcom());
        assertEquals("01", result.getNumcom());
        assertEquals("M01", result.getCodfic());
    }

    @Test
    void updateBonTravailManuel_withModifiedNotices_returnUpdatedData() throws Exception {
        ObjectMapper mapper = createObjectMapper();
        final var variables = mapper.createObjectNode();
        CreateOrUpdateBonTravailManuelPayload payload = createBonTravailManuelPayload(
                true, "T", "750", "SNV2", "240523-00", "MANU", "01", "M01"
        );

        CreateOrUpdateBonTravailManuelNoticesPayload notice3 = new CreateOrUpdateBonTravailManuelNoticesPayload();
        notice3.setCodnot("NOTICE3");
        notice3.setPoinot(new BigDecimal("1"));

        payload.setNotices(List.of(notice3));
        payload.setOldnotices(List.of("NOTICE1", "NOTICE2"));

        variables.set("payload", mapper.valueToTree(payload));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/update-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateBonTravailManuelDTO result = response.get("$.data.updateBonTravailManuel", CreateOrUpdateBonTravailManuelDTO.class);

        assertNotNull(result);
        assertEquals("MANU", result.getCodcom());
    }

    @Test
    void imprimerBonTravail_withValidInput_returnResult() throws Exception {
        ObjectMapper mapper = createObjectMapper();
        final var variables = mapper.createObjectNode();
        variables.set("bonTravailInput", mapper.valueToTree(
                BonTravailInput.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .codcom("MANU")
                        .codfic("M01")
                        .numcom("01")
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/imprimer-bon-travail.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
    }

    private SearchBonTravailManuelQuery createSearchQuery(String codenv, String codorg, String codapp, String codcom, String codfic) {
        SearchBonTravailManuelQuery query = new SearchBonTravailManuelQuery();
        query.setCodenv(codenv);
        query.setCodorg(codorg);
        query.setCodapp(codapp);
        query.setCodcom(codcom);
        query.setCodfic(codfic);
        return query;
    }

    private DeleteBonTravailManuelQuery createDeleteQuery(String codenv, String codorg, String codapp, String percod,
                                                           String codcom, String codfic, String numcom) {
        DeleteBonTravailManuelQuery query = new DeleteBonTravailManuelQuery();
        query.setCodenv(codenv);
        query.setCodorg(codorg);
        query.setCodapp(codapp);
        query.setPercod(percod);
        query.setCodcom(codcom);
        query.setCodfic(codfic);
        query.setNumcom(numcom);
        query.setUser("testUser");
        query.setFormId("testFormId");
        return query;
    }

    private CreateOrUpdateBonTravailManuelPayload createBonTravailManuelPayload(Boolean isedit, String codenv, String codorg,
                                                                                  String codapp, String percod, String codcom,
                                                                                  String numcom, String codfic) {
        CreateOrUpdateBonTravailManuelPayload payload = new CreateOrUpdateBonTravailManuelPayload();
        payload.setIsedit(isedit);
        payload.setCodenv(codenv);
        payload.setCodorg(codorg);
        payload.setCodapp(codapp);
        if (isedit) {
            payload.setPercod(percod);
        }
        payload.setCodcom(codcom);
        payload.setNumcom(numcom);
        payload.setCodfic(codfic);
        payload.setTyptar("RG");
        payload.setPagfic(100);
        payload.setPlific(95);
        payload.setDappcr(LocalDateTime.of(2024, 7, 23, 14, 50, 15));
        payload.setCodsit("CIRTIL");
        payload.setInform("Info test");
        return payload;
    }

}
