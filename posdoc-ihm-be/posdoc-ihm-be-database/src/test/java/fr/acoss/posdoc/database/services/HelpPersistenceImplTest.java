package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.help.model.Help;
import fr.acoss.posdoc.types.HelpStateType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/help/insert-help.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/help/clean-help.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class HelpPersistenceImplTest {
    @Autowired
    private HelpPersistenceImpl helpPersistenceImpl;

    @Test
    void should_select_all_help() {
        List<Help> results = helpPersistenceImpl.selectAll();
        assertNotNull(results);
        assertEquals(3, results.size());
    }

    @Test
    void should_get_help_by_path() {
        List<Help> results = helpPersistenceImpl.getHelpByPath("gestion/ecran");

        assertEquals(2, results.size());
        assertEquals("gestion/ecran", results.get(0).getPath());
        assertEquals(1, results.get(0).getId());
        assertEquals("<p>Message de test</p>", results.get(0).getMessage());
        assertEquals(LocalDateTime.of(2025, Month.NOVEMBER,4, 0, 0), results.get(0).getCreatedAt());
        assertEquals(HelpStateType.ENABLED, results.get(0).getState());
        assertEquals("gestion/ecran", results.get(1).getPath());
        assertEquals(2, results.get(1).getId());
        assertEquals("<p>Message de test2</p>", results.get(1).getMessage());
        assertEquals(LocalDateTime.of(2025, Month.NOVEMBER,5, 0, 0), results.get(1).getCreatedAt());
        assertEquals(HelpStateType.DISABLED, results.get(1).getState());
      }

    @Test
    void should_not_found_help_by_path() {
        List<Help> results = helpPersistenceImpl.getHelpByPath("undefined");

        assertTrue(results.isEmpty());
    }

    @Test
    void should_get_help_by_id() {
        Optional<Help> results = helpPersistenceImpl.getHelpById(2);

        assertTrue(results.isPresent());
        assertEquals("gestion/ecran", results.get().getPath());
        assertEquals(2, results.get().getId());
        assertEquals("<p>Message de test2</p>", results.get().getMessage());
        assertEquals(LocalDateTime.of(2025, Month.NOVEMBER,5, 0, 0), results.get().getCreatedAt());
        assertEquals(HelpStateType.DISABLED, results.get().getState());
    }

    @Test
    void should_not_found_help_by_id() {
        Optional<Help> results = helpPersistenceImpl.getHelpById(99);

        assertTrue(results.isEmpty());
    }

    @Test
    void should_select_help_by_path_and_enable() {
      Optional<Help> results = helpPersistenceImpl.selectAllByPathAndState("gestion/ecran", HelpStateType.ENABLED);

      assertTrue(results.isPresent());
      assertEquals(1, results.get().getId());
    }

    @Test
    void should_not_select_help_path_undefined() {
        Optional<Help> results = helpPersistenceImpl.selectAllByPathAndState("undefined", HelpStateType.ENABLED);

        assertTrue(results.isEmpty());
    }
}