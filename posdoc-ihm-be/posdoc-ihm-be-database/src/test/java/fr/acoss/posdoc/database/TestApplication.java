package fr.acoss.posdoc.database;

import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.domain.utilog.secondary.UtiLogPersistence;
import fr.acoss.posdoc.prisme.PrismeClientInformations;
import org.mockito.Mockito;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class TestApplication {
    @Bean
    public PrismeClientInformations prismeClientInformations() {
        return new PrismeClientInformations();
    }

    @Bean
    @Primary
    public UtiLogService utiLogService() {
        UtiLogPersistence utiLogPersistence = Mockito.mock(UtiLogPersistence.class);
        ParametrePersistence parametrePersistence = Mockito.mock(ParametrePersistence.class);
        return new UtiLogService(utiLogPersistence, parametrePersistence);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

