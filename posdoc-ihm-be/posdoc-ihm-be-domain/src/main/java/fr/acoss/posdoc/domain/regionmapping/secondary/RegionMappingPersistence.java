package fr.acoss.posdoc.domain.regionmapping.secondary;

import fr.acoss.posdoc.domain.regionmapping.model.RegionMapping;

import java.util.List;

public interface RegionMappingPersistence {

    List<RegionMapping> findByCodeAnaisIn(Iterable<String> codeAnais);

}
