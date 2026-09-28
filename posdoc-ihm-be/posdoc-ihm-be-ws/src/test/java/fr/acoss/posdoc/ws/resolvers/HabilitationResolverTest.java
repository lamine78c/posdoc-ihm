package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.HabilitationRepository;
import fr.acoss.posdoc.database.entities.HabilitationEntity;
import fr.acoss.posdoc.types.HabilitationType;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateHabilitationPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@Sql(scripts = {"classpath:sql/habilitation/insert-habilitation.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/habilitation/clean-habilitation.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class HabilitationResolverTest extends AbstractGraphqlTest {

    @Autowired
    private HabilitationRepository habilitationRepository;

    @Test
    void get_all_habilitations_should_return_all_records() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/habilitation/all-habilitations.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateHabilitationPayloadDTO> habilitations = response.getList("$.data.allHabilitations", CreateOrUpdateHabilitationPayloadDTO.class);
        assertEquals(11, habilitations.size());

        CreateOrUpdateHabilitationPayloadDTO firstHabilitation = habilitations.get(0);
        assertEquals(1, firstHabilitation.getId());
        assertNull(firstHabilitation.getParentId());
        assertEquals(HabilitationType.MENU, firstHabilitation.getHabilitationType());
        assertEquals("Administration", firstHabilitation.getIdentite());
        assertEquals(1, firstHabilitation.getOrdre());
    }

    @Test
    void get_all_habilitations_should_include_menus_and_submenus() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/habilitation/all-habilitations.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateHabilitationPayloadDTO> habilitations = response.getList("$.data.allHabilitations", CreateOrUpdateHabilitationPayloadDTO.class);

        long menuCount = habilitations.stream().filter(h -> h.getParentId() == null).count();
        assertEquals(3, menuCount);

        long submenuCount = habilitations.stream().filter(h -> h.getParentId() != null).count();
        assertEquals(8, submenuCount);

        CreateOrUpdateHabilitationPayloadDTO submenu = habilitations.stream()
                .filter(h -> h.getId() == 11)
                .findFirst()
                .orElse(null);
        assertNotNull(submenu);
        assertEquals(1, submenu.getParentId());
        assertEquals("Habilitations", submenu.getIdentite());
        assertEquals(HabilitationType.SOUS_MENU, submenu.getHabilitationType());
    }

    @Test
    void get_all_habilitations_should_return_hierarchical_structure() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/habilitation/all-habilitations.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateHabilitationPayloadDTO> habilitations = response.getList("$.data.allHabilitations", CreateOrUpdateHabilitationPayloadDTO.class);

        CreateOrUpdateHabilitationPayloadDTO adminMenu = habilitations.stream()
                .filter(h -> "Administration".equals(h.getIdentite()))
                .findFirst()
                .orElse(null);
        assertNotNull(adminMenu);
        assertEquals(1, adminMenu.getId());
        assertNull(adminMenu.getParentId());

        List<CreateOrUpdateHabilitationPayloadDTO> adminSubmenus = habilitations.stream()
                .filter(h -> Integer.valueOf(1).equals(h.getParentId()))
                .collect(Collectors.toList());
        assertEquals(3, adminSubmenus.size());
        assertTrue(adminSubmenus.stream().anyMatch(h -> "Habilitations".equals(h.getIdentite())));
        assertTrue(adminSubmenus.stream().anyMatch(h -> "Environnements".equals(h.getIdentite())));
        assertTrue(adminSubmenus.stream().anyMatch(h -> "Utilisateurs".equals(h.getIdentite())));
    }

    @Test
    void create_habilitations_should_add_new_records() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createInput = variables.putObject("updatesDTO");
        final var habilitationsArray = createInput.putArray("habilitations");

        final var newMenu = habilitationsArray.addObject();
        newMenu.put("id", 4);
        newMenu.putNull("parentId");
        newMenu.put("habilitationType", "MENU");
        newMenu.put("identite", "Rapports");
        newMenu.put("ordre", 4);

        final var newSubmenu = habilitationsArray.addObject();
        newSubmenu.put("id", 41);
        newSubmenu.put("parentId", 4);
        newSubmenu.put("habilitationType", "SOUS_MENU");
        newSubmenu.put("identite", "Statistiques");
        newSubmenu.put("ordre", 1);

        final var response = graphQLTestTemplate.perform("graphql-requests/habilitation/create-habilitations.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateHabilitationPayloadDTO> created = response.getList("$.data.createHabilitations", CreateOrUpdateHabilitationPayloadDTO.class);
        assertEquals(2, created.size());

        Optional<HabilitationEntity> menuInDb = habilitationRepository.findById(4);
        assertTrue(menuInDb.isPresent());
        assertEquals("Rapports", menuInDb.get().getIdentite());
        assertEquals(HabilitationType.MENU, menuInDb.get().getHabilitationType());

        Optional<HabilitationEntity> submenuInDb = habilitationRepository.findById(41);
        assertTrue(submenuInDb.isPresent());
        assertEquals("Statistiques", submenuInDb.get().getIdentite());
        assertEquals(HabilitationType.SOUS_MENU, submenuInDb.get().getHabilitationType());
        assertEquals(4, submenuInDb.get().getParentId());
    }

    @Test
    void update_habilitations_should_modify_existing_records() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateInput = variables.putObject("updatesDTO");
        final var habilitationsArray = updateInput.putArray("habilitations");

        final var updateHabilitation = habilitationsArray.addObject();
        updateHabilitation.put("id", 11);
        updateHabilitation.put("parentId", 1);
        updateHabilitation.put("habilitationType", "SOUS_MENU");
        updateHabilitation.put("identite", "Habilitations - Modifié");
        updateHabilitation.put("ordre", 1);

        final var response = graphQLTestTemplate.perform("graphql-requests/habilitation/update-habilitations.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateHabilitationPayloadDTO> updated = response.getList("$.data.updateHabilitations", CreateOrUpdateHabilitationPayloadDTO.class);
        assertEquals(1, updated.size());
        assertEquals("Habilitations - Modifié", updated.get(0).getIdentite());

        Optional<HabilitationEntity> updatedInDb = habilitationRepository.findById(11);
        assertTrue(updatedInDb.isPresent());
        assertEquals("Habilitations - Modifié", updatedInDb.get().getIdentite());
    }

    @Test
    void delete_habilitations_should_remove_records() throws IOException {
        assertTrue(habilitationRepository.findById(31).isPresent());
        assertTrue(habilitationRepository.findById(32).isPresent());

        final var variables = new ObjectMapper().createObjectNode();
        final var deleteInput = variables.putObject("deletesDTO");
        final var idsArray = deleteInput.putArray("ids");
        idsArray.add("31");
        idsArray.add("32");

        final var response = graphQLTestTemplate.perform("graphql-requests/habilitation/delete-habilitations.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean ok = response.get("$.data.deleteHabilitations.ok", Boolean.class);
        assertTrue(ok);

        assertFalse(habilitationRepository.findById(31).isPresent());
        assertFalse(habilitationRepository.findById(32).isPresent());
    }
}
