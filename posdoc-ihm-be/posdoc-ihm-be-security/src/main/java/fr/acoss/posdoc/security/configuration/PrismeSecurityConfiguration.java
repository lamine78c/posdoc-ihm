package fr.acoss.posdoc.security.configuration;

import fr.acoss.posdoc.prisme.PrismeClientInformations;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(PrismeSecurityProperties.class)
public class PrismeSecurityConfiguration implements WebMvcConfigurer {

    @Bean
    public PrismeClientInformations prismeClientInformations() {
        return new PrismeClientInformations();
    }
}
