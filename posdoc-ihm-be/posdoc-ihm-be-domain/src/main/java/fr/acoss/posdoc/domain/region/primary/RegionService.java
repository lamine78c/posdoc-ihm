package fr.acoss.posdoc.domain.region.primary;

import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.domain.region.model.Region;
import fr.acoss.posdoc.domain.region.secondary.RegionPersistence;
import fr.acoss.posdoc.domain.server.validators.ServerValidators;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.region.validators.RegionValidators.codeValidator;
import static fr.acoss.posdoc.domain.region.validators.RegionValidators.libelleValidator;

public class RegionService {

    public static final String REGION = "Region";
    public static final String SERVER = "Server";
    public static final String ORGANISME = "Organisme";

    private final RegionPersistence regionPersistence;
    private final OrganismePersistence organismePersistence;

    public RegionService(
            final RegionPersistence regionPersistence,
            final OrganismePersistence organismePersistence
    ) {
        this.regionPersistence = regionPersistence;
        this.organismePersistence = organismePersistence;
    }

    public Region createRegion(final Region region) {

        codeValidator().validate(region.getCode());
        libelleValidator().validate(region.getLibelle());

        if (regionPersistence.exists(region.getCode())) {
            throw new AlreadyExistingElement(REGION, region.getCode());
        }

        return regionPersistence.create(region);
    }

    public Region updateRegion(final Region region) {

        codeValidator().validate(region.getCode());
        libelleValidator().validate(region.getLibelle());

        if (!regionPersistence.exists(region.getCode())) {
            throw new ElementNotFoundException(REGION, region.getCode());
        }

        return regionPersistence.create(region);
    }

    public void deleteRegion(final String region) {
        regionPersistence.delete(region);
    }

    public List<Region> createRegions(List<Region> regions) {

        regions.stream().forEach(e -> {

            ServerValidators.codeValidator().validate(e.getCode());
            ServerValidators.libelleValidator().validate(e.getLibelle());

            if (regionPersistence.exists(e.getCode())) {
                throw new AlreadyExistingElement(REGION, e.getCode());
            }
        });

        return regionPersistence.updateAll(regions);
    }

    public List<Region> updateRegions(List<Region> regions) {

        regions.stream().forEach(e -> {
            ServerValidators.codeValidator().validate(e.getCode());
            ServerValidators.libelleValidator().validate(e.getLibelle());

            if (!regionPersistence.exists(e.getCode())) {
                throw new ElementNotFoundException(SERVER, e.getCode());
            }
        });

        return regionPersistence.updateAll(regions);
    }

    public void deleteRegions(List<String> regionCodes) {
        // vérification dépendance Organisme
        List<String> listOrg = organismePersistence.regionsExistsInOrganismes(regionCodes);
        if (!listOrg.isEmpty()) {
            throw new StileExistingElement(REGION, regionCodes, ORGANISME);
        }
        regionPersistence.deleteAll(regionCodes);
    }

}
