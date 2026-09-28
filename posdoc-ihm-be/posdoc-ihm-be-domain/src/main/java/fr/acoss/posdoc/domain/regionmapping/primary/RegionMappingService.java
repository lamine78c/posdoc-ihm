package fr.acoss.posdoc.domain.regionmapping.primary;

import fr.acoss.posdoc.domain.regionmapping.model.RegionMapping;
import fr.acoss.posdoc.domain.regionmapping.secondary.RegionMappingPersistence;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class RegionMappingService {

    private final RegionMappingPersistence regionMappingPersistence;

    public RegionMappingService(final RegionMappingPersistence regionMappingPersistence) {
        this.regionMappingPersistence = regionMappingPersistence;
    }

    public List<String> getRegionByCodeAnais(final List<String> codeAnais) {
        //create default list
        Map<String, String> defaultMapping = new HashMap<>();
        codeAnais.forEach(code -> defaultMapping.put(code, code.substring(2)));
        //load list
        Map<String, String> mappingMaps = new HashMap<>();
        List<RegionMapping> mappings = this.regionMappingPersistence.findByCodeAnaisIn(codeAnais);
        mappings.forEach(map -> mappingMaps.put(map.getCodeAnais().trim(), map.getCodeRegion()));
        //merge maps
        defaultMapping.putAll(mappingMaps);
        return new ArrayList<>(defaultMapping.values());
    }

}
