package fr.acoss.posdoc.domain.genapp.primary;

import fr.acoss.posdoc.domain.genapp.secondary.GenAppPersistence;
import fr.acoss.posdoc.domain.occurrence.application.model.SearchOccurrenceApplicationInput;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GenAppServiceTest {
    @Mock
    private GenAppPersistence genAppPersistence;
    private GenAppService genAppService;

    @BeforeEach
    public void setUp() {
        genAppService = new GenAppService(genAppPersistence);
    }

    @Test
    void search_occ_app_no_site_tri_date_ok() {
        SearchOccurrenceApplicationInput input = new SearchOccurrenceApplicationInput();
        input.setTri("DATE");
        input.setExt(false);
        input.setCurrDate("2025-08-28");
        genAppService.searchOccurencePerApplication(input);
        verify(genAppPersistence).searchOccurenceNonSitePerApplicationOrderByDate(input);
    }

    @Test
    void search_occ_app_no_site_tri_appli_ok() {
        SearchOccurrenceApplicationInput input = new SearchOccurrenceApplicationInput();
        input.setTri("APPLI");
        input.setExt(false);
        input.setCurrDate("2025-08-28");
        genAppService.searchOccurencePerApplication(input);
        verify(genAppPersistence).searchOccurenceNonSitePerApplication(input);
    }

    @Test
    void search_occ_app_site_ext_tri_appli_ok() {
        SearchOccurrenceApplicationInput input = new SearchOccurrenceApplicationInput();
        input.setTri("APPLI");
        input.setExt(true);
        input.setCurrDate("2025-08-28");
        input.setCodSit("CIRSO");
        genAppService.searchOccurencePerApplication(input);
        verify(genAppPersistence).searchOccurenceExtPerApplication(input);
    }

    @Test
    void search_occ_app_site_ext_tri_date_ok() {
        SearchOccurrenceApplicationInput input = new SearchOccurrenceApplicationInput();
        input.setTri("DATE");
        input.setExt(true);
        input.setCurrDate("2025-08-28");
        input.setCodSit("CIRSO");
        genAppService.searchOccurencePerApplication(input);
        verify(genAppPersistence).searchOccurenceExtPerApplicationOrderByDate(input);
    }

    @Test
    void search_occ_app_site_no_ext_tri_date_ok() {
        SearchOccurrenceApplicationInput input = new SearchOccurrenceApplicationInput();
        input.setTri("DATE");
        input.setExt(false);
        input.setCurrDate("2025-08-28");
        input.setCodSit("CIRSO");
        genAppService.searchOccurencePerApplication(input);
        verify(genAppPersistence).searchOccurenceNonExtPerApplicationOrderByDate(input);
    }

    @Test
    void search_occ_app_site_no_ext_tri_appli_ok() {
        SearchOccurrenceApplicationInput input = new SearchOccurrenceApplicationInput();
        input.setTri("APPLI");
        input.setExt(false);
        input.setCurrDate("2025-08-28");
        input.setCodSit("CIRSO");
        genAppService.searchOccurencePerApplication(input);
        verify(genAppPersistence).searchOccurenceNonExtPerApplication(input);
    }
}
