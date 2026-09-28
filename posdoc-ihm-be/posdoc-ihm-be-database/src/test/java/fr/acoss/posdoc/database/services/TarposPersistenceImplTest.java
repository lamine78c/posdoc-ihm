package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.TarposRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
@SpringBootTest(classes = TestApplication.class)
@ActiveProfiles("test")
class TarposPersistenceImplTest {

    @Mock
    TarposRepository tarposRepository;

    TarposPersistenceImpl tarposPersistence;

    @BeforeEach
    void initTests() {
        tarposPersistence = new TarposPersistenceImpl(tarposRepository);
    }

    @Test
    void should_select_all_tarpos_nominal() {
        when(tarposRepository.findAll()).thenReturn(List.of());
        tarposPersistence.selectAll();
        verify(tarposRepository).findAll();
    }

    @Test
    void should_select_all_tarpos_with_authorization_nominal() {
        when(tarposRepository.selectAllTarposWithAuthorisation()).thenReturn(List.of());
        tarposPersistence.selectAllWithAuthorisation();
        verify(tarposRepository).selectAllTarposWithAuthorisation();
    }
}
