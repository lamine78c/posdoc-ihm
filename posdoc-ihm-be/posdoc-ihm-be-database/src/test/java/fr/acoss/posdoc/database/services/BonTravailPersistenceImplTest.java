package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdateDTO;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdatePayload;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.model.SearchBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.model.UserInfoPayload;
import fr.acoss.posdoc.domain.genfic.model.BonTravailDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeResultDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPayload;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPeriodeFilterPayload;
import fr.acoss.posdoc.domain.genfic.model.BonTravailResultDTO;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelDTO;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelNoticesPayload;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelPayload;
import fr.acoss.posdoc.domain.genfic.model.GenFic;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;


@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/bon-travail/insert-bon-travail.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/bon-travail/clean-bon-travail.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class BonTravailPersistenceImplTest {
    @Autowired
    private BonTravailPersistenceImpl bonTravailPersistenceImpl;

    @Autowired
    private BonTravailManuelPersistenceImpl bonTravailManuelPersistenceImpl;

    @Test
    void testDoSearchBontravail() {
        BonTravailPayload bonTravailPayload = new BonTravailPayload();
        bonTravailPayload.setCodorg(List.of("750"));
        bonTravailPayload.setCodenv("T");
        bonTravailPayload.setCodapp("SNV2");
        BonTravailResultDTO result = bonTravailPersistenceImpl.doSearchBonTravail(bonTravailPayload, null);
        List<BonTravailDTO> response = result.getBonsTravail();
        assertEquals(2, response.size());
        assertEquals("RDEH", response.get(0).getCodcom());
        assertEquals("SNV2", response.get(0).getCodapp());
        assertEquals("RDEH", response.get(1).getCodcom());
        assertEquals("SNV2", response.get(1).getCodapp());
    }

    @Test
    void testDoSearchBontravailBuildMasap() {
        BonTravailPayload bonTravailPayload = new BonTravailPayload();
        bonTravailPayload.setCodorg(List.of("750"));
        bonTravailPayload.setCodenv("T");
        bonTravailPayload.setCodapp("SNV2");
        BonTravailResultDTO result = bonTravailPersistenceImpl.doSearchBonTravail(bonTravailPayload, "SNV2");
        List<BonTravailDTO> response = result.getBonsTravail();
        assertEquals(2, response.size());
        assertEquals("RDEH", response.get(0).getCodcom());
        assertEquals("SNV2", response.get(0).getCodapp());
        assertEquals("RDEH", response.get(1).getCodcom());
        assertEquals("SNV2", response.get(1).getCodapp());
    }

    @Test
    void testSearchBonTravail() {
        BonTravailPayload bonTravailPayload = new BonTravailPayload();
        bonTravailPayload.setCodorg(List.of("750"));
        bonTravailPayload.setCodenv("T");
        bonTravailPayload.setCodapp("SNV2");
        BonTravailGroupByPeriodeResultDTO result = bonTravailPersistenceImpl.findBonTravail(bonTravailPayload, null);
        List<BonTravailGroupByPeriodeDTO> response = result.getGroupedBonTravail();
        assertEquals(1, response.size());
        assertEquals("RDEH", response.get(0).getCodcom());
        assertEquals("SNV2", response.get(0).getCodapp());
    }

    @Test
    void testSearchBonTravailByDateRange() {
        BonTravailPayload bonTravailPayload = new BonTravailPayload();
        bonTravailPayload.setCodorg(List.of("750"));
        bonTravailPayload.setCodenv("T");
        bonTravailPayload.setCodapp("SNV2");
        bonTravailPayload.setDappcrDeb("2024-01-01 00:00:00");
        bonTravailPayload.setDappcrFin("2025-01-01 00:00:00");
        BonTravailGroupByPeriodeResultDTO result = bonTravailPersistenceImpl.findBonTravail(bonTravailPayload, null);
        List<BonTravailGroupByPeriodeDTO> response = result.getGroupedBonTravail();
        assertEquals(1, response.size());
        assertEquals("RDEH", response.get(0).getCodcom());
        assertEquals("SNV2", response.get(0).getCodapp());
        assertEquals("2024-07-23T14:50:15", response.get(0).getDappcr().toString());
        assertNull(response.get(0).getDfiexp());

        bonTravailPayload.setDappcrDeb("2024-08-01 00:00:00");
        result = bonTravailPersistenceImpl.findBonTravail(bonTravailPayload, null);
        response = result.getGroupedBonTravail();
        assertEquals(0, response.size());

        bonTravailPayload = new BonTravailPayload();
        bonTravailPayload.setCodorg(List.of("750"));
        bonTravailPayload.setCodenv("T");
        bonTravailPayload.setCodapp("SNV2");
        bonTravailPayload.setDfiexpDeb("2024-01-01");
        bonTravailPayload.setDfiexpFin("2025-01-01");
        result = bonTravailPersistenceImpl.findBonTravail(bonTravailPayload, null);
        response = result.getGroupedBonTravail();
        assertEquals(0, response.size());
    }

    @Test
    void testSearchBonTravailIsEmpty() {
        BonTravailPayload bonTravailPayload = new BonTravailPayload();
        bonTravailPayload.setCodorg(List.of("750"));
        bonTravailPayload.setCodenv("T");
        bonTravailPayload.setCodapp("SNV2");
        bonTravailPayload.setIsDateEmpty(Boolean.TRUE);
        BonTravailGroupByPeriodeResultDTO result = bonTravailPersistenceImpl.findBonTravail(bonTravailPayload, null);
        List<BonTravailGroupByPeriodeDTO> response = result.getGroupedBonTravail();
        assertEquals(1, response.size());
    }

    @Test
    void testSearchBonTravailByPeriode() {
        BonTravailPayload bonTravailPayload = new BonTravailPayload();
        bonTravailPayload.setCodorg(List.of("750"));
        bonTravailPayload.setCodenv("T");
        bonTravailPayload.setCodapp("SNV2");
        bonTravailPayload.setPercod("240523-00");
        BonTravailGroupByPeriodeResultDTO result = bonTravailPersistenceImpl.findBonTravail(bonTravailPayload, null);
        List<BonTravailGroupByPeriodeDTO> response = result.getGroupedBonTravail();
        assertEquals(1, response.size());
        assertEquals("RDEH", response.get(0).getCodcom());
        assertEquals("SNV2", response.get(0).getCodapp());

        bonTravailPayload.setCodorg(List.of("750"));
        bonTravailPayload.setCodenv("T");
        bonTravailPayload.setCodapp("SNV2");
        bonTravailPayload.setPercod("240520-00");
        result = bonTravailPersistenceImpl.findBonTravail(bonTravailPayload, null);
        response = result.getGroupedBonTravail();
        assertEquals(0, response.size(), "la période n'existe pas");
    }

    @Test
    void testGetPeriodeFromGenAppWhereCodEnvAndCodOrg(){
        BonTravailPeriodeFilterPayload bonTravailPeriodeFilterPayload = new BonTravailPeriodeFilterPayload();
        bonTravailPeriodeFilterPayload.setCodenv("T");
        List<String> codorgs = new LinkedList<>();
        codorgs.add("750");
        bonTravailPeriodeFilterPayload.setCodorg(codorgs);
        bonTravailPeriodeFilterPayload.setCodapp("SNV2");
        List<String> response = bonTravailPersistenceImpl.getPeriodeFromGenAppWhereCodEnvAndCodOrg(bonTravailPeriodeFilterPayload);
        assertEquals(1, response.size());
        assertEquals("240523-00", response.get(0));
    }

    @Test
    void testSearchBonTravailManuel() {
        SearchBonTravailManuelQuery query = new SearchBonTravailManuelQuery();
        query.setCodenv("P");
        query.setCodorg("117");
        query.setCodapp("SNV2");
        query.setCodcom("AD04");
        query.setCodfic("L00");
        List<BonTravailGroupByPeriodeDTO> response = bonTravailManuelPersistenceImpl.findBonTravailManuel(query);

        assertEquals(1, response.size());
        assertEquals("SNV2", response.get(0).getCodapp());
        assertEquals("24-000001", response.get(0).getCodbon());
    }

    @Test
    void testDeleteBonTravailManuel() {
        DeleteBonTravailManuelQuery query = new DeleteBonTravailManuelQuery();
        query.setCodenv("P");
        query.setCodorg("117");
        query.setCodapp("SNV2");
        query.setPercod("241224-A0");
        query.setCodcom("AD04");
        query.setCodfic("L00");
        query.setNumcom("00");
        query.setUser(" ");
        query.setFormId("Suppression bon de travail manuel");
        bonTravailManuelPersistenceImpl.deleteBonTravailManuel(query);

        SearchBonTravailManuelQuery searchQuery = new SearchBonTravailManuelQuery();
        searchQuery.setCodenv("P");
        searchQuery.setCodorg("117");
        searchQuery.setCodapp("SNV2");
        searchQuery.setCodcom("AD04");
        searchQuery.setCodfic("L00");
        List<BonTravailGroupByPeriodeDTO> response = bonTravailManuelPersistenceImpl.findBonTravailManuel(searchQuery);

        assertEquals(0, response.size());
    }

    @Test
    void updateBonTravail_withInput_returnData() {
        final var bonTravailList = new ArrayList<BonTravailUpdatePayload>();
        final var userInfo = new UserInfoPayload("AC75098133", "Bon de travail");
        bonTravailList.add(BonTravailUpdatePayload.builder()
                .id("testid").codapp("SNV2").codfic("L02").numcom("00").codcom("RDEH").codenv("T").percod("240523-00").codorg("750")
                .datexp("2025-01-05 18:00:00").inform("info test")
                .build());

        List<BonTravailUpdateDTO> response = bonTravailPersistenceImpl.updateBonTravail(bonTravailList, userInfo);

        assertEquals("info test", response.get(0).getInform());
        assertEquals(LocalDateTime.parse("2024-12-23T14:50:15"), response.get(0).getDrecep());
    }

    @Test
    void createBonTravailManuel() {
        final var payload = new CreateOrUpdateBonTravailManuelPayload();
        payload.setIsedit(false);
        payload.setNumcom("00");
        payload.setCodenv("T");
        payload.setCodcom("RDEH");
        payload.setCodfic("L02");
        payload.setCodapp("SNV2");
        payload.setCodorg("750");
        payload.setCodsit("CIRSO");
        payload.setDappcr(LocalDateTime.parse("2024-05-23T10:10:10"));
        payload.setPagfic(10);
        payload.setPlific(5);
        payload.setTyptar("CD");
        List<CreateOrUpdateBonTravailManuelNoticesPayload> notices = new ArrayList<>();
        CreateOrUpdateBonTravailManuelNoticesPayload notice = new CreateOrUpdateBonTravailManuelNoticesPayload();
        notice.setCodnot("CESU1");
        notice.setPoinot(BigDecimal.valueOf(1));
        notices.add(notice);
        notice.setCodnot("CESU2");
        notice.setPoinot(BigDecimal.valueOf(2));
        payload.setNotices(notices);
        CreateOrUpdateBonTravailManuelDTO response = bonTravailManuelPersistenceImpl.createOrUpdate(payload);
        assertEquals(bonTravailManuelPersistenceImpl.getPercodPrefix()+"-M0", response.getPercod());
        assertEquals("SNV2", response.getCodapp());
    }

    @Test
    void updateBonTravailManuel() {
        final var payload = new CreateOrUpdateBonTravailManuelPayload();
        payload.setIsedit(true);
        payload.setNumcom("00");
        payload.setCodenv("T");
        payload.setCodcom("RDEH");
        payload.setCodfic("L02");
        payload.setCodapp("SNV2");
        payload.setCodorg("750");
        payload.setCodsit("CIRSO");
        payload.setDappcr(LocalDateTime.parse("2024-05-23T10:10:10"));
        payload.setPagfic(100);
        payload.setPlific(50);
        payload.setTyptar("CD");
        payload.setPercod("240523-00");
        List<String> notices = new ArrayList<>();
        notices.add("CESU1");
        notices.add("CESU2");
        payload.setOldnotices(notices);
        CreateOrUpdateBonTravailManuelDTO response = bonTravailManuelPersistenceImpl.createOrUpdate(payload);
        assertEquals("240523-00", response.getPercod());

    }

    @Test
    void testIncrementPercod() {
        String response = bonTravailManuelPersistenceImpl.incrementPercod("E", "TTT", "APP");
        assertEquals(bonTravailManuelPersistenceImpl.getPercodPrefix()+"-M0", response);
    }

    @Test
    void testIncrementEnBase36() {
        String response = bonTravailManuelPersistenceImpl.incrementEnBase36("MZ");
        assertEquals("N0", response);
    }

    @Test
    void testCalculCoutTotal() {
        final var payload = new CreateOrUpdateBonTravailManuelPayload();
        payload.setTyptar("CD");
        payload.setPagfic(10);
        payload.setPlific(10);
        int response = bonTravailManuelPersistenceImpl.calculCoutTotal(payload);
        assertEquals(5820, response);
    }

    @Test
    void testCalculCodBon() {
        final var codbon = "25-123459";
        final var aa = "25";
        String response = bonTravailManuelPersistenceImpl.incrementCodBon(codbon, aa);
        assertEquals("25-123460", response);
    }

    @Test
    void updateAll_withGenFicList_returnUpdatedData() {
        final var genFicList = new ArrayList<GenFic>();

        GenFic genFic1 = bonTravailPersistenceImpl.findById("T", "750", "SNV2", "240523-00", "RDEH", "00", "L02");
        genFic1.setInform("Updated info from updateAll");
        genFic1.setDfiexp(LocalDateTime.parse("2025-02-01T00:00:00"));

        genFicList.add(genFic1);

        List<BonTravailUpdateDTO> response = bonTravailPersistenceImpl.updateAll(genFicList);

        assertEquals(1, response.size());
        assertEquals("Updated info from updateAll", response.get(0).getInform());
        assertEquals("SNV2", response.get(0).getCodapp());
        assertEquals(LocalDateTime.parse("2025-02-01T00:00:00"), response.get(0).getDfiexp());
    }

    // Tests pour les validations de dates
    @Test
    void updateBonTravail_withInvalidDateExp_throwsException() {
        final var bonTravailList = new ArrayList<BonTravailUpdatePayload>();
        final var userInfo = new UserInfoPayload("AC75098133", "Bon de travail");
        bonTravailList.add(BonTravailUpdatePayload.builder()
                .id("testid").codapp("SNV2").codfic("L02").numcom("00").codcom("RDEH").codenv("T")
                .percod("240523-00").codorg("750")
                .datexp("2024-01-01 00:00:00") // Date antérieure à la date de réception
                .build());

        CustomExceptionMessage exception = assertThrows(CustomExceptionMessage.class, () -> {
            bonTravailPersistenceImpl.updateBonTravail(bonTravailList, userInfo);
        });

        assertTrue(exception.getMessage().contains("doit être ultérieure ou égale"));
    }

    @Test
    void updateBonTravail_withDateExpTooFar_throwsException() {
        final var bonTravailList = new ArrayList<BonTravailUpdatePayload>();
        final var userInfo = new UserInfoPayload("AC75098133", "Bon de travail");
        bonTravailList.add(BonTravailUpdatePayload.builder()
                .id("testid").codapp("SNV2").codfic("L02").numcom("00").codcom("RDEH").codenv("T")
                .percod("240523-00").codorg("750")
                .datexp("2099-12-31 23:59:59")
                .build());

        CustomExceptionMessage exception = assertThrows(CustomExceptionMessage.class, () -> {
            bonTravailPersistenceImpl.updateBonTravail(bonTravailList, userInfo);
        });

        assertTrue(exception.getMessage().contains("est trop loin par rapport à la date de prise en compte"));
    }

    @Test
    void updateBonTravail_withValidDateExp_success() {
        final var bonTravailList = new ArrayList<BonTravailUpdatePayload>();
        final var userInfo = new UserInfoPayload("AC75098133", "Bon de travail");
        bonTravailList.add(BonTravailUpdatePayload.builder()
                .id("testid").codapp("SNV2").codfic("L02").numcom("00").codcom("RDEH").codenv("T")
                .percod("240523-00").codorg("750")
                .datexp("2025-01-10 00:00:00")
                .build());

        List<BonTravailUpdateDTO> response = bonTravailPersistenceImpl.updateBonTravail(bonTravailList, userInfo);

        assertEquals(1, response.size());
        assertEquals(LocalDateTime.parse("2025-01-10T00:00:00"), response.get(0).getDfiexp());
    }

    @Test
    void updateBonTravail_withOnlyInformUpdate_success() {
        final var bonTravailList = new ArrayList<BonTravailUpdatePayload>();
        final var userInfo = new UserInfoPayload("AC75098133", "Bon de travail");
        bonTravailList.add(BonTravailUpdatePayload.builder()
                .id("testid").codapp("SNV2").codfic("L02").numcom("00").codcom("RDEH").codenv("T")
                .percod("240523-00").codorg("750")
                .inform("Only info update")
                .build());

        List<BonTravailUpdateDTO> response = bonTravailPersistenceImpl.updateBonTravail(bonTravailList, userInfo);

        assertEquals(1, response.size());
        assertEquals("Only info update", response.get(0).getInform());
    }
}
