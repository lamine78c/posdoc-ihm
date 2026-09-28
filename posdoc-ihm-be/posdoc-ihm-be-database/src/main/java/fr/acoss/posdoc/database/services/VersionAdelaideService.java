package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;

@Service
public class VersionAdelaideService {
    private String adelaideVersion;
    private final ParametrePersistence parametrePersistence;

    @Autowired
    public VersionAdelaideService(final ParametrePersistence parametrePersistence) {
        this.parametrePersistence = parametrePersistence;
    }

    @CachePut(value = "adelaideVersion")
    public String loadVersionToCache() {
        this.adelaideVersion = parametrePersistence.getAdelaideVersion();
        return this.adelaideVersion;
    }

    public String getAdelaideVersion() {
        return this.adelaideVersion;
    }
}
