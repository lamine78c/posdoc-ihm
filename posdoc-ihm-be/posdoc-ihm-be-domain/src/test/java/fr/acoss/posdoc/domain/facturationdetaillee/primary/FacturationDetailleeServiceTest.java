package fr.acoss.posdoc.domain.facturationdetaillee.primary;

import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationWithAllColumns;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetaillee;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeWithAllColumns;
import fr.acoss.posdoc.domain.facturationdetaillee.model.TarifFacturationDetaillee;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchFacturationDetailleeQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.secondary.FacturationDetailleePersistence;
import fr.acoss.posdoc.domain.tarpos.secondary.TarposPersistence;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FacturationDetailleeServiceTest {

    @Mock
    private FacturationDetailleePersistence facturationDetailleePersistence;

    @Mock
    private TarposPersistence tarposPersistence;

    private FacturationDetailleeService facturationDetailleeService;

    @BeforeEach
    public void setUp() {
        facturationDetailleeService = new FacturationDetailleeService(
                facturationDetailleePersistence,
                tarposPersistence
        );
    }

    private FacturationDetaillee createFacturationDetaillee(final String codorg, final LocalDateTime dfiexp, final Integer pagfic, final String typtar, final String nbplis, final String coutot) {
        final var facturationDetaillee = new FacturationDetaillee();
        facturationDetaillee.setCodorg(codorg);
        facturationDetaillee.setDfiexp(dfiexp);
        facturationDetaillee.setPagfic(pagfic);
        facturationDetaillee.setTyptar(typtar);
        facturationDetaillee.setNbplis(nbplis);
        facturationDetaillee.setCoutot(coutot);
        return facturationDetaillee;
    }

    @Test
    void searchFacturationDetaillee_ok() {
        final List<FacturationDetaillee> facturations = new ArrayList<>();
        facturations.add(createFacturationDetaillee("117", LocalDateTime.of(2025, 1, 29, 0, 0), 43, "ECN,ECO", "10,33", "4761,2640"));
        facturations.add(createFacturationDetaillee("42C", LocalDateTime.of(2024, 12, 25, 0, 0), 220, "DD,DD,LET", "33,88,88", "4719,0,8391749"));

        when(facturationDetailleePersistence.searchFacturationDetaillee(any()))
                .thenReturn(new FacturationDetailleeDTO(facturations, ""));

        final var dto = facturationDetailleeService.searchFacturationDetaillee(any(SearchFacturationDetailleeQuery.class));
        final var facturationDetailleeWithAllColumns = dto.getFacturationDetailleeWithAllColumns();

        verify(facturationDetailleePersistence, times(1)).searchFacturationDetaillee(any());

        assertEquals(2, facturationDetailleeWithAllColumns.size());
        for (final FacturationDetailleeWithAllColumns facturationWithAllCols : facturationDetailleeWithAllColumns) {
            assertNotNull(facturationWithAllCols.getCodorg());
            assertNotNull(facturationWithAllCols.getDfiexp());
        }

        FacturationDetailleeWithAllColumns facturation1 = facturationDetailleeWithAllColumns.get(0);
        assertEquals(2, facturation1.getTarifs().size());
        TarifFacturationDetaillee colonne1 = facturation1.getTarifs().get(0);
        assertEquals("ECN", colonne1.getCodeTar());
        assertEquals(10, colonne1.getPlis());
        assertEquals(4.761f, colonne1.getCout());

        FacturationDetailleeWithAllColumns facturation2 = facturationDetailleeWithAllColumns.get(1);
        assertEquals(2, facturation2.getTarifs().size());
        colonne1 = facturation2.getTarifs().get(0);
        assertEquals("DD", colonne1.getCodeTar());
        assertEquals(121, colonne1.getPlis());
        assertEquals(4.719f, colonne1.getCout());
    }

    @Test
    void searchConsolidationFacturation_ok() {
        final List<ConsolidationFacturation> consolidations = new ArrayList<>();
        consolidations.add(createConsolidationFacturation(LocalDateTime.of(2025, 3, 10, 0, 0), "ECN,ECO", "10,33", "4761,2640", "0, 0"));
        consolidations.add(createConsolidationFacturation(LocalDateTime.of(2025, 3, 15, 0, 0), "DD,DD,LET", "33,88,88", "4719,0,8391749", "0, 0, 0"));

        ConsolidationFacturationDTO dto = new ConsolidationFacturationDTO(consolidations, "");

        when(facturationDetailleePersistence.searchConsolidationFacturation(any()))
                .thenReturn(dto);

        final var consolidationFacturationWithAllColumnsDTO = facturationDetailleeService.searchConsolidationFacturation(any(SearchConsolidationFacturationQuery.class));
        final var consolidationFacturationWithAllColumns = consolidationFacturationWithAllColumnsDTO.getConsolidationFacturationList();
        verify(facturationDetailleePersistence, times(1)).searchConsolidationFacturation(any());

        assertEquals(2, consolidationFacturationWithAllColumns.size());
        for (final ConsolidationFacturationWithAllColumns consolidationWithAllCols : consolidationFacturationWithAllColumns) {
            assertNotNull(consolidationWithAllCols.getCodorg());
            assertNotNull(consolidationWithAllCols.getDfiexp());
        }

        ConsolidationFacturationWithAllColumns consolidation1 = consolidationFacturationWithAllColumns.get(0);
        assertEquals(2, consolidation1.getTarifs().size());
        TarifFacturationDetaillee colonne1 = consolidation1.getTarifs().get(0);
        assertEquals("ECN", colonne1.getCodeTar());
        assertEquals(10, colonne1.getPlis());
        assertEquals(4.761f, colonne1.getCout());

        ConsolidationFacturationWithAllColumns consolidation2 = consolidationFacturationWithAllColumns.get(1);
        assertEquals(2, consolidation2.getTarifs().size());
        colonne1 = consolidation2.getTarifs().get(0);
        assertEquals("DD", colonne1.getCodeTar());
        assertEquals(121, colonne1.getPlis());
        assertEquals(4.719f, colonne1.getCout());
    }

    private ConsolidationFacturation createConsolidationFacturation(final LocalDateTime dfiexp, final String typtar, final String nbplis, final String coutot, final String compta) {
        final var consolidationFacturation = new ConsolidationFacturation();
        consolidationFacturation.setCodenv("P");
        consolidationFacturation.setCodorg("117");
        consolidationFacturation.setCodapp("SNV2");
        consolidationFacturation.setPercod("250307-00");
        consolidationFacturation.setDfiexp(dfiexp);
        consolidationFacturation.setTyptar(typtar);
        consolidationFacturation.setNbplis(nbplis);
        consolidationFacturation.setCoutot(coutot);
        consolidationFacturation.setCompta(compta);
        return consolidationFacturation;
    }

}
