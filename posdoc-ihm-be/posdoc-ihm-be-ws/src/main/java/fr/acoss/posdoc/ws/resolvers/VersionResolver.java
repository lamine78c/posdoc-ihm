package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.service.VersionService;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
public class VersionResolver extends AbstractQueryResolver {

    private static final String T = "T";
    private static final String Z = "Z";
    private static final String VERSION = "version";
    private static final String DATE = "date";

    private final VersionAdelaideService versionAdelaideService;

    public VersionResolver(VersionAdelaideService versionAdelaideService) {
        super();
        this.versionAdelaideService = versionAdelaideService;
    }

    public String getVersion() {
        Properties versionProperties = VersionService.getProperties();
        String date = ((String) versionProperties.get(DATE)).replace(T, StringUtils.ESPACE).replace(Z, StringUtils.EMPTY);
        return versionProperties.getProperty(VERSION) + StringUtils.ESPACE + date;
    }

    public String getVersionAdelaide() {
        return versionAdelaideService.loadVersionToCache();
    }

}
