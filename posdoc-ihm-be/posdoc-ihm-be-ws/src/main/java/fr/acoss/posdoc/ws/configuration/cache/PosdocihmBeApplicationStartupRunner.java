package fr.acoss.posdoc.ws.configuration.cache;

import fr.acoss.posdoc.database.services.VersionAdelaideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PosdocihmBeApplicationStartupRunner implements CommandLineRunner {

    private final VersionAdelaideService adelaideVersionService;

    @Autowired
    public PosdocihmBeApplicationStartupRunner(final VersionAdelaideService adelaideVersionService) {
        this.adelaideVersionService = adelaideVersionService;
    }

    @Override
    public void run(String... args) throws Exception {
        adelaideVersionService.loadVersionToCache();

    }
}
