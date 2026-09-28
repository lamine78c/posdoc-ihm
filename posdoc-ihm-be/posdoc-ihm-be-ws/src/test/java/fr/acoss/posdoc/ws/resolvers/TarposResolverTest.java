package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.HistoryRepository;
import fr.acoss.posdoc.database.dao.TarposRepository;
import fr.acoss.posdoc.database.dao.UtiLogRepository;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.database.entities.UtiLogEntity;
import fr.acoss.posdoc.domain.tarpos.primary.TarposService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.lang.reflect.Array;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@Slf4j
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class TarposResolverTest  extends AbstractGraphqlTest {

    @Autowired
    public TarposRepository tarposRepository;

    @Autowired
    private UtiLogRepository utiLogRepository;

    @Autowired
    private HistoryRepository historyRepository;

    @Test
    void createTarpos_nominal() throws IOException {
        LocalDateTime startTime = LocalDateTime.now();
        final var response = createTarpos();


        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("DC", response.get("$.data.createTarpos.type"));
        assertEquals("0001", response.get("$.data.createTarpos.libelle"));
        assertEquals("2", response.get("$.data.createTarpos.ordre"));
        assertEquals("true", response.get("$.data.createTarpos.tlibre"));
        assertEquals("true", response.get("$.data.createTarpos.compta"));
        assertEquals("false", response.get("$.data.createTarpos.perime"));

        LocalDateTime endTime = LocalDateTime.now();

        List<UtiLogEntity> logEntities = utiLogRepository.findUtiLogEntitiesByDatuloBetween(startTime, endTime);
        UtiLogEntity logEntity= logEntities.get(0);
        assertEquals("Administration > Tarifs", logEntity.getFormid());

        List<HistoryEntity> historyEntityList = historyRepository.findByCodulo(logEntity.getCodulo());

        assertEquals(1, historyEntityList.size());
    }

    @Test
    void updateTarpos_nominal() throws IOException {
        final var variables = createVariables();
        var response = createTarpos(variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        var obj = variables.with("var");
        obj.put("libelle", "1111");
        obj.put("perime", false);


        variables.put("var", obj);

        response = updateTarpos(variables);
        assertEquals("1111", response.get("$.data.updateTarpos.libelle"));
        assertEquals("false", response.get("$.data.updateTarpos.perime"));
    }

    @Test
    void deleteTarpos_nominal() throws IOException {
        final var variables = createVariables();
        createTarpos(variables);

        final var deleteVariables = new ObjectMapper().createObjectNode();
        final var delete = deleteVariables.putObject("var");
        ArrayNode arrayNode = delete.arrayNode();
        arrayNode.add("DC");
        delete.put("ids", arrayNode);

        final var deleteResponse = graphQLTestTemplate.perform("graphql-requests/tarpos/delete-tarpos.graphql",
                deleteVariables);

        assertNotNull(deleteResponse);
        assertTrue(deleteResponse.isOk());

        assertFalse(tarposRepository.existsById("DC"));
    }



    ObjectNode createVariables () {
        return createVariables("DC",
                "0001",
                2,
                true,
                true,
                false);
    }

    private GraphQLResponse createTarpos() throws IOException {
        final var variables2 = createVariables();

        return graphQLTestTemplate.perform("graphql-requests/tarpos/create-tarpos.graphql",
                variables2);
    }

    private GraphQLResponse createTarpos(ObjectNode variables) throws IOException {
        return graphQLTestTemplate.perform("graphql-requests/tarpos/create-tarpos.graphql",
                variables);
    }

    private GraphQLResponse updateTarpos(ObjectNode variables) throws IOException {
        return graphQLTestTemplate.perform("graphql-requests/tarpos/update-tarpos.graphql",
                variables);
    }

    public ObjectNode createVariables(final String type, final String libelle, final Integer ordre,
                                      final Boolean tlibre, final Boolean compta, final Boolean perime) {
        final var variables = new ObjectMapper().createObjectNode();
        final var tarpos = variables.putObject("var");
        tarpos.put("type", type);
        tarpos.put("libelle", libelle);
        tarpos.put("ordre", ordre);
        tarpos.put("tlibre", tlibre);
        tarpos.put("compta", compta);
        tarpos.put("perime", perime);
        return variables;
    }
}
