package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.UtilisateurRepository;
import fr.acoss.posdoc.database.entities.UtilisateurEntity;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateUtilisateurPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@Sql(scripts = {"classpath:sql/utilisateur/insert-utilisateur.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/utilisateur/clean-utilisateur.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UtilisateurResolverTest extends AbstractGraphqlTest {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Test
    void get_utilisateurs_paginated_should_return_records() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var queryInput = variables.putObject("queryParametersInputDTO");
        final var paginationParams = queryInput.putObject("paginationParameters");
        paginationParams.put("page", 0);
        paginationParams.put("size", 10);
        paginationParams.putArray("sort");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/utilisateurs-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        PaginatedDTO paginated = response.get("$.data.utilisateurs", PaginatedDTO.class);
        assertNotNull(paginated);
        assertEquals(5, paginated.getTotalElement());

        List<CreateOrUpdateUtilisateurPayloadDTO> utilisateurs = response.getList("$.data.utilisateurs.elements", CreateOrUpdateUtilisateurPayloadDTO.class);
        assertEquals(5, utilisateurs.size());

        CreateOrUpdateUtilisateurPayloadDTO firstUtilisateur = utilisateurs.get(0);
        assertEquals("USER001", firstUtilisateur.getCodeUtilisateur());
        assertEquals("Utilisateur Test 1", firstUtilisateur.getLibelleUtilisateur());
        assertEquals("ADMIN", firstUtilisateur.getProfile());
        assertTrue(firstUtilisateur.getActif());
        assertEquals("P", firstUtilisateur.getCodeEnvironnement());
        assertEquals("SITE01", firstUtilisateur.getCodeSite());
    }

    @Test
    void get_utilisateurs_paginated_should_filter_by_code() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var queryInput = variables.putObject("queryParametersInputDTO");
        final var paginationParams = queryInput.putObject("paginationParameters");
        paginationParams.put("page", 0);
        paginationParams.put("size", 10);
        paginationParams.putArray("sort");

        final var filterCriteria = queryInput.putObject("filterCriteria");
        final var filtersArray = filterCriteria.putArray("criteria");
        final var filter = filtersArray.addObject();
        filter.put("column", "codeUtilisateur");
        filter.put("operation", "EQUALS");
        filter.put("value", "USER002");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/utilisateurs-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        PaginatedDTO paginated = response.get("$.data.utilisateurs", PaginatedDTO.class);
        assertNotNull(paginated);
        assertEquals(1, paginated.getTotalElement());

        List<CreateOrUpdateUtilisateurPayloadDTO> utilisateurs = response.getList("$.data.utilisateurs.elements", CreateOrUpdateUtilisateurPayloadDTO.class);
        assertEquals(1, utilisateurs.size());
        assertEquals("USER002", utilisateurs.get(0).getCodeUtilisateur());
    }

    @Test
    void create_utilisateur_should_add_new_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createInput = variables.putObject("createDTO");
        createInput.put("codeUtilisateur", "USER006");
        createInput.put("libelleUtilisateur", "Nouvel Utilisateur");
        createInput.put("profile", "USER");
        createInput.put("password", "newpassword");
        createInput.put("actif", 1);
        createInput.put("codeEnvironnement", "P");
        createInput.put("codeSite", "SITE01");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/create-utilisateur.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateUtilisateurPayloadDTO created = response.get("$.data.createUtilisateur", CreateOrUpdateUtilisateurPayloadDTO.class);
        assertNotNull(created);
        assertEquals("USER006", created.getCodeUtilisateur());
        assertEquals("Nouvel Utilisateur", created.getLibelleUtilisateur());
        assertEquals("USER", created.getProfile());
        assertTrue(created.getActif());

        Optional<UtilisateurEntity> inDb = utilisateurRepository.findById("USER006");
        assertTrue(inDb.isPresent());
        assertEquals("Nouvel Utilisateur", inDb.get().getLibelleUtilisateur());
        assertEquals("USER", inDb.get().getProfile());
    }

    @Test
    void update_utilisateur_should_modify_existing_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateInput = variables.putObject("updateDTO");
        updateInput.put("codeUtilisateur", "USER001");
        updateInput.put("libelleUtilisateur", "Utilisateur Test 1 - Modifié");
        updateInput.put("profile", "SUPER_ADMIN");
        updateInput.put("password", "newpassword123");
        updateInput.put("actif", 1);
        updateInput.put("codeEnvironnement", "P");
        updateInput.put("codeSite", "SITE01");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/update-utilisateur.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateUtilisateurPayloadDTO updated = response.get("$.data.updateUtilisateur", CreateOrUpdateUtilisateurPayloadDTO.class);
        assertNotNull(updated);
        assertEquals("USER001", updated.getCodeUtilisateur());
        assertEquals("Utilisateur Test 1 - Modifié", updated.getLibelleUtilisateur());
        assertEquals("SUPER_ADMIN", updated.getProfile());

        Optional<UtilisateurEntity> updatedInDb = utilisateurRepository.findById("USER001");
        assertTrue(updatedInDb.isPresent());
        assertEquals("Utilisateur Test 1 - Modifié", updatedInDb.get().getLibelleUtilisateur());
        assertEquals("SUPER_ADMIN", updatedInDb.get().getProfile());
    }

    @Test
    void delete_utilisateur_should_remove_record() throws IOException {
        assertTrue(utilisateurRepository.findById("USER003").isPresent());

        final var variables = new ObjectMapper().createObjectNode();
        final var deleteInput = variables.putObject("deleteDTO");
        deleteInput.put("id", "USER003");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/delete-utilisateur.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean ok = response.get("$.data.deleteUtilisateur.ok", Boolean.class);
        assertTrue(ok);

        assertFalse(utilisateurRepository.findById("USER003").isPresent());
    }

    @Test
    void delete_utilisateurs_should_remove_multiple_records() throws IOException {
        assertTrue(utilisateurRepository.findById("USER004").isPresent());
        assertTrue(utilisateurRepository.findById("USER005").isPresent());

        final var variables = new ObjectMapper().createObjectNode();
        final var deleteInput = variables.putObject("deletesDTO");
        final var idsArray = deleteInput.putArray("ids");
        idsArray.add("USER004");
        idsArray.add("USER005");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/delete-utilisateurs.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean ok = response.get("$.data.deleteUtilisateurs.ok", Boolean.class);
        assertTrue(ok);

        assertFalse(utilisateurRepository.findById("USER004").isPresent());
        assertFalse(utilisateurRepository.findById("USER005").isPresent());
    }

    @Test
    void update_utilisateurs_should_modify_multiple_records() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updatesInput = variables.putObject("updatesDTO");
        final var utilisateursArray = updatesInput.putArray("utilisateurs");

        final var utilisateur1 = utilisateursArray.addObject();
        utilisateur1.put("codeUtilisateur", "USER001");
        utilisateur1.put("libelleUtilisateur", "Utilisateur 1 - Mis à jour");
        utilisateur1.put("profile", "ADMIN");
        utilisateur1.put("password", "password123");
        utilisateur1.put("actif", 1);
        utilisateur1.put("codeEnvironnement", "P");
        utilisateur1.put("codeSite", "SITE01");

        final var utilisateur2 = utilisateursArray.addObject();
        utilisateur2.put("codeUtilisateur", "USER002");
        utilisateur2.put("libelleUtilisateur", "Utilisateur 2 - Mis à jour");
        utilisateur2.put("profile", "USER");
        utilisateur2.put("password", "password456");
        utilisateur2.put("actif", 0);
        utilisateur2.put("codeEnvironnement", "P");
        utilisateur2.put("codeSite", "SITE02");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/update-utilisateurs.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateUtilisateurPayloadDTO> updated = response.getList("$.data.updateUtilisateurs", CreateOrUpdateUtilisateurPayloadDTO.class);
        assertEquals(2, updated.size());

        assertTrue(updated.stream().anyMatch(u -> "Utilisateur 1 - Mis à jour".equals(u.getLibelleUtilisateur())));
        assertTrue(updated.stream().anyMatch(u -> "Utilisateur 2 - Mis à jour".equals(u.getLibelleUtilisateur())));

        Optional<UtilisateurEntity> user1InDb = utilisateurRepository.findById("USER001");
        assertTrue(user1InDb.isPresent());
        assertEquals("Utilisateur 1 - Mis à jour", user1InDb.get().getLibelleUtilisateur());

        Optional<UtilisateurEntity> user2InDb = utilisateurRepository.findById("USER002");
        assertTrue(user2InDb.isPresent());
        assertEquals("Utilisateur 2 - Mis à jour", user2InDb.get().getLibelleUtilisateur());
        assertEquals(Integer.valueOf(0), user2InDb.get().getActif());
    }

    @Test
    void get_utilisateurs_should_include_inactive_users() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var queryInput = variables.putObject("queryParametersInputDTO");
        final var paginationParams = queryInput.putObject("paginationParameters");
        paginationParams.put("page", 0);
        paginationParams.put("size", 10);
        paginationParams.putArray("sort");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/utilisateurs-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateUtilisateurPayloadDTO> utilisateurs = response.getList("$.data.utilisateurs.elements", CreateOrUpdateUtilisateurPayloadDTO.class);

        long inactiveCount = utilisateurs.stream().filter(u -> !u.getActif()).count();
        assertEquals(1, inactiveCount);

        CreateOrUpdateUtilisateurPayloadDTO inactiveUser = utilisateurs.stream()
                .filter(u -> "USER004".equals(u.getCodeUtilisateur()))
                .findFirst()
                .orElse(null);
        assertNotNull(inactiveUser);
        assertFalse(inactiveUser.getActif());
    }

    @Test
    void create_utilisateur_without_site_should_work() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createInput = variables.putObject("createDTO");
        createInput.put("codeUtilisateur", "USER007");
        createInput.put("libelleUtilisateur", "Utilisateur Sans Site");
        createInput.put("profile", "USER");
        createInput.put("password", "password777");
        createInput.put("actif", 1);
        createInput.put("codeEnvironnement", "T");
        createInput.putNull("codeSite");

        final var response = graphQLTestTemplate.perform("graphql-requests/utilisateur/create-utilisateur.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateUtilisateurPayloadDTO created = response.get("$.data.createUtilisateur", CreateOrUpdateUtilisateurPayloadDTO.class);
        assertNotNull(created);
        assertEquals("USER007", created.getCodeUtilisateur());
        assertNull(created.getCodeSite());

        Optional<UtilisateurEntity> inDb = utilisateurRepository.findById("USER007");
        assertTrue(inDb.isPresent());
        assertNull(inDb.get().getCodeSite());
    }
}
