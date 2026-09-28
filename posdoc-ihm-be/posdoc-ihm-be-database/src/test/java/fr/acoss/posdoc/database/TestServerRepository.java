package fr.acoss.posdoc.database;

import fr.acoss.posdoc.domain.common.search.FilterCriteria;
import fr.acoss.posdoc.domain.common.search.FilterCriterion;
import fr.acoss.posdoc.domain.common.search.PaginationParameters;
import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.common.search.Sort;
import fr.acoss.posdoc.domain.server.model.Server;
import fr.acoss.posdoc.domain.server.secondary.ServerPersistence;
import fr.acoss.posdoc.types.Direction;
import fr.acoss.posdoc.types.SearchOperation;
import fr.acoss.posdoc.types.Systeme;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.ArrayList;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestServerRepository {

    private static final Logger LOGGER = LoggerFactory.getLogger(TestServerRepository.class);

    @Autowired
    private ServerPersistence serverPersistence;

    @Test
    void findAllServer_code_start_with_ADEL() {

        final var criterions = Collections.singletonList(new FilterCriterion("code",
                "%ADEL%",
                SearchOperation.LIKE));

        final var filterCriteria = new FilterCriteria(criterions);

        final var list = new ArrayList<Sort>();
        list.add(new Sort("code", Direction.ASCENDING));

        final var paginationParameters = new PaginationParameters(0, 10, list);

        final var searchParameters = new QueryParameters(filterCriteria, paginationParameters);

        final var servers = serverPersistence.select(searchParameters);
        assertEquals(4, servers.getTotalElement());
        assertEquals(1, servers.getTotalPages());
        assertEquals(4, servers.getElements().size());

        for (final Server server : servers.getElements()) {
            assertTrue(server.getCode().startsWith("ADEL"));
        }

    }

    @Test
    void testSearchService_find_all_linux_servers() {

        final var criterions = Collections.singletonList(new FilterCriterion("systeme",
                "LINUX",
                SearchOperation.EQUALS));

        final var filterCriteria = new FilterCriteria(criterions);

        final var list = new ArrayList<Sort>();
        list.add(new Sort("code", Direction.ASCENDING));

        final var paginationParameters = new PaginationParameters(0, 3, list);

        final var searchParameters = new QueryParameters(filterCriteria, paginationParameters);

        final var servers = serverPersistence.select(searchParameters);
        assertEquals(7, servers.getTotalElement());
        assertEquals(3, servers.getTotalPages());
        assertEquals(3, servers.getElements().size());

        for (final Server server : servers.getElements()) {
            assertEquals(Systeme.LINUX, server.getSysteme());
        }

        final var paginationParameters2 = new PaginationParameters(1, 3, list);
        final var searchParameters2 = new QueryParameters(filterCriteria, paginationParameters2);

        final var servers2 = serverPersistence.select(searchParameters2);
        assertEquals(7, servers2.getTotalElement());
        assertEquals(3, servers2.getTotalPages());
        assertEquals(3, servers2.getElements().size());

        for (final Server server : servers2.getElements()) {
            assertEquals(Systeme.LINUX, server.getSysteme());

            //On vérifie aussi qu'on a des éléments différents
            assertFalse(servers.getElements().contains(server));
        }

    }

}
