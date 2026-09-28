package fr.acoss.posdoc.domain.regionmapping.primary;

import fr.acoss.posdoc.domain.regionmapping.model.RegionMapping;
import fr.acoss.posdoc.domain.regionmapping.secondary.RegionMappingPersistence;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegionMappingServiceTest {

    @Mock
    private RegionMappingPersistence regionMappingPersistence;

    private RegionMappingService regionMappingService;

    @BeforeEach
    public void setUp() {
        regionMappingService = new RegionMappingService(regionMappingPersistence);
    }

    @Test
    void getRegionByByCodeAnaisTest() {
        List<RegionMapping> regionMappingListMock = new LinkedList<>();
        regionMappingListMock.add(new RegionMapping("117a", "UR117"));
        regionMappingListMock.add(new RegionMapping("154a", "UR154"));
        when(regionMappingPersistence.findByCodeAnaisIn(anyIterable())).thenReturn(regionMappingListMock);

        List<String> codeAnais = new ArrayList<>();
        codeAnais.add("UR117");
        codeAnais.add("UR154");
        codeAnais.add("UR114");
        List<String> result = regionMappingService.getRegionByCodeAnais(codeAnais);
        assertNotNull(result);
        assertTrue(result.contains("117a"));
        assertTrue(result.contains("154a"));
        assertTrue(result.contains("114"));

    }
}
