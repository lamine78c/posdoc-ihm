package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.TestApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/path-habili/insert-path-habili.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/path-habili/clean-path-habili.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class PathHabiliPersistenceImplTest {
    @Autowired
    private PathHabiliPersistenceImpl pathHabiliPersistenceImpl;

    @Test
    void get_path_complet_by_path_ok() {
        String result = pathHabiliPersistenceImpl.getPathCompletByPath("/admin/organisme#organismes");
        assertNotNull(result);
        assertEquals("Administration > Organisme > Organismes", result);

        result = pathHabiliPersistenceImpl.getPathCompletByPath("/admin/habilitation");
        assertNotNull(result);
        assertEquals("Administration > Habilitations", result);

        result = pathHabiliPersistenceImpl.getPathCompletByPath("/path/not/exist");
        assertNull(result);
    }

    @Test
    void get_all_path_complet_ok() {
        Context context = new Context();
        context.setProfileFromString("NAT_ADMINISTRATEUR");
        ContextHolder.setContext(context);
        List<Map<String, String>> result = pathHabiliPersistenceImpl.getAllPathComplet();
        assertNotNull(result);
        assertEquals(4, result.size());

        context.setProfileFromString("CNE");
        ContextHolder.setContext(context);
        result = pathHabiliPersistenceImpl.getAllPathComplet();
        assertNotNull(result);
        assertEquals(3, result.size());

        context.setProfileFromString("GESTION");
        ContextHolder.setContext(context);
        result = pathHabiliPersistenceImpl.getAllPathComplet();
        assertNotNull(result);
        assertEquals(1, result.size());
    }
}