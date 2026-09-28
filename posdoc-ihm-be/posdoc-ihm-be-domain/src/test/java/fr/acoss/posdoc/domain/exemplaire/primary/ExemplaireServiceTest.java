package fr.acoss.posdoc.domain.exemplaire.primary;

import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByResource;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireExistsQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireRessource;
import fr.acoss.posdoc.domain.exemplaire.model.RessourceExistForOrganismeSiteQuery;
import fr.acoss.posdoc.domain.exemplaire.model.query.ExemplaireByRessourceQuery;
import fr.acoss.posdoc.domain.exemplaire.secondary.ExemplairePersistence;
import fr.acoss.posdoc.domain.fichier.model.query.SearchOrgByEnvAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.primary.FichierService;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.produi.secondary.ProduiPersistence;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ExemplaireServiceTest {

    @Mock
    private ExemplairePersistence exemplairePersistence;

    @Mock
    private ProduiPersistence produiPersistence;

    @Mock
    private RessourcePersistence ressourcePersistence;

    @Mock
    private ParametrePersistence parametrePersistence;

    private ExemplaireService exemplaireService;

    @Mock
    private FichierService fichierService;

    @BeforeEach
    public void setUp() {
        exemplaireService = new ExemplaireService(
                exemplairePersistence,
                produiPersistence,
                ressourcePersistence,
                parametrePersistence,
                fichierService);
    }

    @Test
    void getParametresEditionByRessource_ok() {
        final List<ExemplaireByResource> exemplaires = getListExemplaireByResource();
        ExemplaireByRessourceQuery query = new ExemplaireByRessourceQuery();
        query.setIsRessourcesAbsentes(Boolean.FALSE);
        doReturn(exemplaires).when(exemplairePersistence).getParametresEditionByRessource(any(), eq("999"));
        final List<ExemplaireByResource> result = exemplaireService.getParametresEditionByRessource(query, "999");

        verify(exemplairePersistence, times(1)).getParametresEditionByRessource(query, "999");
        assertEquals(1, result.size());
        ExemplaireByResource exemplaire = result.get(0);
        assertEquals("L00", exemplaire.getCodfic());
        assertEquals(1, exemplaire.getRessources().size());
        ExemplaireRessource exRes = exemplaire.getRessources().get(0);
        assertEquals("DM", exRes.getCodgam());
        assertEquals("GED-HUI", exRes.getCodres());
    }

    @Test
    void createExemplaire_shouldThrow_whenRessourceDoesNotExistForOrganismeSite() {
        Exemplaire exemplaire = getExemplaire();
        doReturn("999").when(parametrePersistence).getValueByCode("OGUORG");
        doReturn(false).when(exemplairePersistence)
                .ressourceExists(any(ExemplaireExistsQuery.class));
        doReturn(List.of("770")).when(fichierService).getOrgByEnvAppComFics(any(SearchOrgByEnvAppComFicsQuery.class));
        doReturn(false).when(ressourcePersistence)
                .isRessourceExistForOrganismeSite(any(RessourceExistForOrganismeSiteQuery.class));

        assertThrows(CustomExceptionMessage.class, () -> exemplaireService.createExemplaire(exemplaire));

        ArgumentCaptor<RessourceExistForOrganismeSiteQuery> queryCaptor =
                ArgumentCaptor.forClass(RessourceExistForOrganismeSiteQuery.class);
        verify(ressourcePersistence).isRessourceExistForOrganismeSite(queryCaptor.capture());
        RessourceExistForOrganismeSiteQuery query = queryCaptor.getValue();
        assertEquals("770", query.getCodorg());
        assertEquals("SNV2", query.getCodapp());
        assertEquals("CIRTIL", query.getCodsit());
        assertEquals("DM", query.getCodgam());
        assertEquals("AZTEST_1", query.getCodres());
        assertEquals("999", query.getGenericOrganisme());
        verify(exemplairePersistence, never()).create(any());
    }

    @Test
    void createExemplaire_shouldCreate_whenRessourceExistsForOrganismeSite() {
        Exemplaire exemplaire = getExemplaire();
        doReturn("999").when(parametrePersistence).getValueByCode("OGUORG");
        doReturn(false).when(exemplairePersistence)
                .ressourceExists(any(ExemplaireExistsQuery.class));
        doReturn(List.of("770")).when(fichierService).getOrgByEnvAppComFics(any(SearchOrgByEnvAppComFicsQuery.class));
        doReturn(true).when(ressourcePersistence)
                .isRessourceExistForOrganismeSite(any(RessourceExistForOrganismeSiteQuery.class));
        doReturn(exemplaire).when(exemplairePersistence).create(exemplaire);

        Exemplaire result = exemplaireService.createExemplaire(exemplaire);

        assertEquals("01", result.getNumexe());
        verify(exemplairePersistence, times(1)).create(exemplaire);
    }

    @Test
    void udateExemplaire_shouldThrow_whenRessourceDoesNotExist() {
        Exemplaire exemplaire = getExemplaire();
        doReturn("999").when(parametrePersistence).getValueByCode("OGUORG");
        doReturn(true).when(exemplairePersistence)
                .exists(any(), any(), any(), any(), any(), any(), any());
        doReturn(false).when(ressourcePersistence)
                .isRessourceExist(any(RessourceExistForOrganismeSiteQuery.class));

        assertThrows(CustomExceptionMessage.class, () -> exemplaireService.updateExemplaire(exemplaire));

        ArgumentCaptor<RessourceExistForOrganismeSiteQuery> queryCaptor =
                ArgumentCaptor.forClass(RessourceExistForOrganismeSiteQuery.class);
        verify(ressourcePersistence).isRessourceExist(queryCaptor.capture());
        RessourceExistForOrganismeSiteQuery query = queryCaptor.getValue();
        assertEquals("770", query.getCodorg());
        assertEquals("SNV2", query.getCodapp());
        assertEquals("CIRTIL", query.getCodsit());
        assertEquals("DM", query.getCodgam());
        assertEquals("AZTEST_1", query.getCodres());
        assertEquals("999", query.getGenericOrganisme());
        verify(exemplairePersistence, never()).update(any());
    }

    private Exemplaire getExemplaire() {
        Exemplaire exemplaire = new Exemplaire();
        exemplaire.setCodenv("T");
        exemplaire.setCodorg("770");
        exemplaire.setCodapp("SNV2");
        exemplaire.setCodcom("AZAZ");
        exemplaire.setCodfic("NC29");
        exemplaire.setCodgam("DM");
        exemplaire.setCodsit("CIRTIL");
        exemplaire.setCodres("AZTEST_1");
        exemplaire.setNbrexe(1);
        exemplaire.setExeact(Boolean.TRUE);
        return exemplaire;
    }

    private List<ExemplaireByResource> getListExemplaireByResource() {
        ExemplaireByResource exemplaire1 = new ExemplaireByResource();
        exemplaire1.setCodenv("P");
        exemplaire1.setCodorg("117");
        exemplaire1.setCodapp("SNV2");
        exemplaire1.setCodcom("AD04");
        exemplaire1.setCodfic("L00");
        exemplaire1.setMessage("");

        ExemplaireRessource exRes1 = new ExemplaireRessource();
        exRes1.setExemplaireExists(Boolean.TRUE);
        exRes1.setCodgam("DM");
        exRes1.setCodres("GED-HUI");
        exRes1.setCodsit("CIRTIL");
        exRes1.setCodorg("117");
        exRes1.setEtat(Boolean.TRUE);
        exRes1.setCoddes(null);
        exRes1.setHasProfil(Boolean.TRUE);

        exemplaire1.setRessources(List.of(exRes1));

        ExemplaireByResource exemplaire2 = new ExemplaireByResource();
        exemplaire2.setCodenv("P");
        exemplaire2.setCodorg("117");
        exemplaire2.setCodapp("SNV2");
        exemplaire2.setCodcom("AD04");
        exemplaire2.setCodfic("L01");
        exemplaire2.setMessage("");

        ExemplaireRessource exRes2 = new ExemplaireRessource();
        exRes2.setExemplaireExists(Boolean.FALSE);
        exRes2.setCodgam("MB");
        exRes2.setCodres("PAPYRUS");
        exRes2.setCodsit("CIRSO");
        exRes2.setCodorg("967");
        exRes2.setEtat(Boolean.TRUE);
        exRes2.setCoddes(null);
        exRes2.setHasProfil(Boolean.TRUE);

        exemplaire2.setRessources(List.of(exRes2));
        return List.of(exemplaire1, exemplaire2);
    }
}
