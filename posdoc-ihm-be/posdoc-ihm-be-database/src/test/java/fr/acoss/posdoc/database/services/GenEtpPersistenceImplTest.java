package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.GenEtpRepository;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapePayload;
import fr.acoss.posdoc.types.GenEtpType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/volumes-traites/insert-volumes-traites.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/volumes-traites/clean-volumes-traites.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class GenEtpPersistenceImplTest {

    private GenEtpPersistenceImpl genEtpPersistence;

    @Mock
    private GenEtpRepository genEtpRepository;

    @Mock
    private GenFicRepository genFicRepository;

    @BeforeEach
    void intTests() {
        genEtpPersistence = new GenEtpPersistenceImpl(genEtpRepository, genFicRepository);
    }


    @Test
    void shouldCallSearchWithTypdatWhenDatesAndTypdatProvided() {
        OccurrenceEtapePayload payload = new OccurrenceEtapePayload();
        payload.setCodenv("A");
        payload.setTypetp(GenEtpType.DEB);
        payload.setTypdat("TYPDAT");
        payload.setDatdeb("2024/01/01");
        payload.setDatfin("2024/01/31");

        String datdebFormatted = DateUtils.formatDateWithDash(payload.getDatdeb(), DateUtils.MIDNIGHT_TIME);
        String datfinFormatted = DateUtils.formatDateWithDash(payload.getDatfin(), DateUtils.END_OF_DAY_TIME);

        GenEtp genEtpExpected = new GenEtp();
        genEtpExpected.setCodenv("A");
        List<GenEtp> expected = List.of(genEtpExpected);
        when(genEtpRepository.searchOccurrenceEtapeWithTypdatDatdebDatfin(
                any(), anyList(), eq(datdebFormatted), eq(datfinFormatted))
        ).thenReturn(expected);

        List<GenEtp> result = genEtpPersistence.searchOccurrenceEtape(payload);

        assertEquals(expected, result);
        verify(genEtpRepository).searchOccurrenceEtapeWithTypdatDatdebDatfin(
                payload, List.of(GenEtpType.DEB), datdebFormatted, datfinFormatted
        );
    }

    @Test
    void shouldCallSearchWithoutTypdatWhenDatesOrTypdatMissing() {
        OccurrenceEtapePayload payload = new OccurrenceEtapePayload();
        payload.setTypetp(GenEtpType.DEB); // typdat is null

        List<GenEtp> expected = List.of(new GenEtp());
        when(genEtpRepository.searchOccurrenceEtape(any(), anyList())).thenReturn(expected);

        List<GenEtp> result = genEtpPersistence.searchOccurrenceEtape(payload);

        assertEquals(expected, result);
        verify(genEtpRepository).searchOccurrenceEtape(
                payload, List.of(GenEtpType.DEB)
        );
    }

    @Test
    void shouldUseAllGenEtpTypesWhenTypetpIsNull() {
        OccurrenceEtapePayload payload = new OccurrenceEtapePayload(); // typetp = null

        List<GenEtp> expected = List.of(new GenEtp());
        when(genEtpRepository.searchOccurrenceEtape(any(), anyList())).thenReturn(expected);

        List<GenEtp> result = genEtpPersistence.searchOccurrenceEtape(payload);

        assertEquals(expected, result);
        verify(genEtpRepository).searchOccurrenceEtape(
                payload, List.of(GenEtpType.values())
        );
    }
}
