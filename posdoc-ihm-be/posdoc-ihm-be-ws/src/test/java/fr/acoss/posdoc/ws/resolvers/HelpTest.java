package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.HelpRepository;
import fr.acoss.posdoc.database.entities.HelpEntity;
import fr.acoss.posdoc.types.HelpStateType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@Sql(scripts = {"/sql/help/insert-help.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"/sql/help/clean-help.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class HelpTest extends AbstractGraphqlTest {

    @Autowired
    private HelpRepository helpRepository;

    @Test
    void search_all_help_ok() throws IOException {

        final var response = graphQLTestTemplate.postForResource("graphql-requests/help/searchAll-help.graphql");

        assertNotNull(response);
        assertTrue(response.isOk());
        List<HelpEntity> responseList = response.getList("$.data.searchAll", HelpEntity.class);
        assertEquals(3, responseList.size());
    }

    @Test
    void getPublication_by_path_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("path", "gestion/ecran");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/getPublication-help.graphql", variables);

        List<HelpEntity> helpEntities = response.getList("$.data.getPublication", HelpEntity.class);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(HelpStateType.ENABLED, helpEntities.get(0).getState());
        assertEquals("gestion/ecran", helpEntities.get(0).getPath());
        assertEquals("<p>Message de test</p>", helpEntities.get(0).getMessage());
    }

    @Test
    void getPublication_by_path_ko() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("path", "undefined");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/getPublication-help.graphql", variables);

        List<HelpEntity> helpEntities = response.getList("$.data.getPublication", HelpEntity.class);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(helpEntities.isEmpty());
    }

    @Test
    void enable_help_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", "2");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/changeState-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<HelpEntity> helpEntity = response.getList("$.data.changeStateHelp", HelpEntity.class);

        assertFalse(helpEntity.isEmpty());
        assertEquals(Integer.valueOf(2), helpEntity.size());
        assertEquals(HelpStateType.ENABLED, helpEntity.get(0).getState());
    }

    @Test
    void enable_help_ok_when_other_help_enabled() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", "2");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/changeState-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(helpRepository.findById(1).isEmpty());

        List<HelpEntity> helpEntity = response.getList("$.data.changeStateHelp", HelpEntity.class);

        assertFalse(helpEntity.isEmpty());
        assertEquals(Integer.valueOf(2), helpEntity.size());
        assertEquals(HelpStateType.ENABLED, helpEntity.get(0).getState());
    }

    @Test
    void enable_help_when_not_exist() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", "99");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/changeState-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("L'élément Help (99) n'existe pas", response.get("$.errors[0].message"));
    }

    @Test
    void disable_help_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", 1);

        final var response = graphQLTestTemplate.perform("graphql-requests/help/changeState-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<HelpEntity> helpEntity = response.getList("$.data.changeStateHelp", HelpEntity.class);

        assertFalse(helpEntity.isEmpty());
        assertEquals(Integer.valueOf(3), helpEntity.size());
        assertEquals(HelpStateType.DISABLED, helpEntity.get(0).getState());
    }

    @Test
    void disable_help_when_not_exist() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", "99");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/changeState-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("L'élément Help (99) n'existe pas", response.get("$.errors[0].message"));
    }

    @Test
    void create_help_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var help = variables.putObject("helpPayload");
        help.put("path", "gestion/prix");
        help.put("message", "tata");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/create-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<HelpEntity> helpEntity = response.getList("$.data.createHelp", HelpEntity.class);

        assertFalse(helpEntity.isEmpty());
        assertEquals(Integer.valueOf(4), helpEntity.size());
        assertEquals(HelpStateType.DRAFT, helpEntity.get(3).getState());
        assertEquals("gestion/prix", helpEntity.get(3).getPath());
        assertEquals("tata", helpEntity.get(3).getMessage());
        assertNotNull(helpEntity.get(3).getCreatedAt());
    }

    @Test
    void create_help_ko() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var help = variables.putObject("helpPayload");
        help.put("path", "gestion/ecran");
        help.put("message", "tata");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/create-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        assertEquals("L'élément Help (gestion/ecran) est déjà existant",  response.get("$.errors[0].message"));
    }

    @Test
    void delete_help_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", "2");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/delete-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteHelp.ok"));
    }

    @Test
    void delete_help_ko() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", "99");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/delete-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("L'élément Help (99) n'existe pas", response.get("$.errors[0].message"));
    }

    @Test
    void update_help_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var help = variables.putObject("helpPayload");
        help.put("id", 2);
        help.put("message", "tatatata");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/update-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<HelpEntity> helpEntity = response.getList("$.data.updateHelp", HelpEntity.class);

        assertFalse(helpEntity.isEmpty());
        assertEquals(Integer.valueOf(3), helpEntity.size());
        assertEquals(2, helpEntity.get(1).getId());
        assertEquals("gestion/ecran", helpEntity.get(1).getPath());
        assertEquals("tatatata", helpEntity.get(1).getMessage());
    }

    @Test
    void update_help_ok_when_help_enabled() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var help = variables.putObject("helpPayload");
        help.put("id", 1);
        help.put("message", "tatatata");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/update-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<HelpEntity> helpInDB = helpRepository.findById(1);
        assertTrue(helpInDB.isPresent());
        assertEquals(HelpStateType.ENABLED, helpInDB.get().getState());

        List<HelpEntity> helpEntity = response.getList("$.data.updateHelp", HelpEntity.class);

        assertFalse(helpEntity.isEmpty());
        assertEquals(Integer.valueOf(3), helpEntity.size());
        assertEquals(HelpStateType.DRAFT, helpEntity.get(2).getState());
        assertNotEquals(1, helpEntity.get(2).getId());
        assertEquals("gestion/ecran", helpEntity.get(2).getPath());
        assertEquals("tatatata", helpEntity.get(2).getMessage());
        assertNotNull(helpEntity.get(2).getUpdatedAt());
    }

    @Test
    void update_help_ok_when_help_disabled() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var help = variables.putObject("helpPayload");
        help.put("id", 3);
        help.put("message", "tatatata");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/update-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<HelpEntity> helpInDB = helpRepository.findById(3);
        assertTrue(helpInDB.isPresent());
        assertEquals(HelpStateType.DISABLED, helpInDB.get().getState());

        List<HelpEntity> helpEntity = response.getList("$.data.updateHelp", HelpEntity.class);

        assertFalse(helpEntity.isEmpty());
        assertEquals(Integer.valueOf(4), helpEntity.size());
        assertEquals(HelpStateType.DRAFT, helpEntity.get(3).getState());
        assertNotEquals(3, helpEntity.get(3).getId());
        assertEquals("administration/tarifs/details", helpEntity.get(3).getPath());
        assertEquals("tatatata", helpEntity.get(3).getMessage());
        assertNotNull(helpEntity.get(3).getUpdatedAt());
    }

    @Test
    void update_help_ko() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var help = variables.putObject("helpPayload");
        help.put("id", 99);
        help.put("message", "tatatata");

        final var response = graphQLTestTemplate.perform("graphql-requests/help/update-help.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("L'élément Help (99) n'existe pas", response.get("$.errors[0].message"));
    }
}