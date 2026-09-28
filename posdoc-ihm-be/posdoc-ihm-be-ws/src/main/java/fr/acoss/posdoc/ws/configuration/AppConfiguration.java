package fr.acoss.posdoc.ws.configuration;

import fr.acoss.posdoc.ws.resolvers.query.*;
import graphql.execution.AsyncExecutionStrategy;
import graphql.execution.ExecutionStrategy;
import graphql.kickstart.tools.SchemaParserDictionary;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;

@Configuration
public class AppConfiguration implements WebMvcConfigurer {

  @Bean
  public SchemaParserDictionary getSchemaParser() {
    final var dictionary = new SchemaParserDictionary();
    dictionary.add("Server", ServerDTO.class)
            .add("Support", SupportDTO.class)
            .add("Client", ClientDTO.class)
            .add("Environnement", EnvironnementDTO.class)
            .add("Gamme", GammeDTO.class)
            .add("InformationOrganisme", InformationOrganismeDTO.class)
            .add("Organisme", OrganismeDTO.class)

            .add("ParametreDistribution", ParametreDistributionDTO.class)
            .add("Region", RegionDTO.class)
            .add("SiteCNP", SiteCNPDTO.class)
            .add("SiteOrganisme", SiteOrganismeDTO.class)
            .add("Verrou", VerrouDTO.class)
            .add("Imprime", ImprimeDTO.class)
            .add("ParametreEchantillon", ParametreEchantillonDTO.class)
            .add("Utilisateur", UtilisateurDTO.class)
            .add("Profile", ProfileDTO.class)
            .add("Format", FormatDTO.class)
            .add("Multif", MultifDTO.class)
            .add("Composition", CompositionDTO.class)
            .add("ParametreEdition", ParametreEditionDTO.class)
            .add("Application", ApplicationDTO.class)
            .add("LotRef", LotRefDTO.class)
            .add("Commande", CommandeDTO.class)
            .add("Groupe", GroupeDTO.class)
            .add("AdresseRetour", AdresseRetourDTO.class)
            .add("Destinataire", DestinataireDTO.class)
            .add("GenPro", GenProDTO.class)
            .add("Fichier", FichierDTO.class)
            .add("History", HistoryDTO.class)
            .add("GenEtp", GenEtpDTO.class)
            .add("HisPro", HisProDTO.class)
            .add("GenDoc", GenDocDTO.class)
            .add("StaDoc", StaDocDTO.class)
            .add("Produi", ProduiDTO.class)
    ;
    return dictionary;
  }

  @Bean
  public ExecutionStrategy asyncExecutionStrategy() {
    return new AsyncExecutionStrategy(new GraphQLDataFetchingExceptionHandler());
  }

  @Bean
  public RestTemplate restTemplate(RestTemplateBuilder builder) {
    return builder
        .setConnectTimeout(Duration.ofSeconds(5))
        .setReadTimeout(Duration.ofSeconds(10))
        .build();
  }

}
