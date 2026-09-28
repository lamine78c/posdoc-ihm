package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.entities.ApplicationEntity;
import fr.acoss.posdoc.domain.application.model.Application;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/application/insert-application.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/application/clean-application.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class ApplicationRepositoryTest {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Test
    @Transactional
    void findApplications_test_orderby_code() {
        final List<Application> result = applicationRepository.findApplications();
        assertEquals(2, result.size());
        assertEquals(1, result.stream().filter(a -> "CES".equals(a.getCode()) && Boolean.TRUE.equals(a.getIsNotAuthorisedToBeDeleted())).count());
        assertEquals(1, result.stream().filter(a -> "PNR".equals(a.getCode()) && Boolean.FALSE.equals(a.getIsNotAuthorisedToBeDeleted())).count());
    }

    @Test
    @Transactional
    void findApplicationsByEnv_test() {
        final List<ApplicationEntity> result = applicationRepository.findApplicationsByEnv(List.of("P", "R"));
        assertEquals(1, result.size());
    }

    @Test
    @Transactional
    void environnementsExistsInApplications_test() {
        final List<String> result = applicationRepository.environnementsExistsInApplications(List.of("P", "T"));
        assertEquals(2, result.size());
    }

    @Test
    @Transactional
    void organismesExistsInApplications_test() {
        final List<String> result = applicationRepository.organismesExistsInApplications(List.of("117", "910"));
        assertEquals(1, result.size());
    }

    @Test
    @Transactional
    void findCodeApp_test() {
        final List<String> result = applicationRepository.findCodeApp();
        assertEquals(2, result.size());
    }


    @Test
    @Transactional
    void findCodeAppByEnvOrgs_test() {
        final List<String> result = applicationRepository.findCodeAppByEnvOrgs("P", List.of("117", "910"));
        assertEquals(1, result.size());
    }
}
