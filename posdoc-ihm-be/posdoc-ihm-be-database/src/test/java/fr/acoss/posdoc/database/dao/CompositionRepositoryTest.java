package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.entities.CompositionEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/composition/insert-composition.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/composition/clean-composition.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class CompositionRepositoryTest {

    @Autowired
    private CompositionRepository compositionRepository;


    @Test
    @Transactional
    void selectAll_test() {
        final List<CompositionEntity> results = compositionRepository.selectAll();
        assertEquals(4, results.size());
        assertEquals(1, results.stream()
                .filter(d -> "-".equals(d.getCode()) && Boolean.TRUE.equals(d.getIsNotAuthorisedToBeDeleted()))
                .count());
        assertEquals(1, results.stream()
                .filter(d -> "A".equals(d.getCode()) && Boolean.TRUE.equals(d.getIsNotAuthorisedToBeDeleted()))
                .count());
        assertEquals(1, results.stream()
                .filter(d -> "B".equals(d.getCode()) && Boolean.FALSE.equals(d.getIsNotAuthorisedToBeDeleted()))
                .count());
        assertEquals(1, results.stream()
                .filter(d -> "C".equals(d.getCode()) && Boolean.FALSE.equals(d.getIsNotAuthorisedToBeDeleted()))
                .count());
    }
}
