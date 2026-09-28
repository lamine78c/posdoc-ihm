package fr.acoss.posdoc.ws.configuration.scalars;

import graphql.schema.GraphQLScalarType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ScalarsConfiguration {

  @Bean
  public GraphQLScalarType localDateTimeScalarType() {
    return GraphQLScalarType.newScalar().name("DateTime").description(
        "Représente une date (date et heure)").coercing(new DateTimeCoercing()).build();
  }

  @Bean
  public GraphQLScalarType localDateScalarType() {
    return GraphQLScalarType.newScalar().name("Date").description(
        "Représente une date (date uniquement)").coercing(new DateCoercing()).build();
  }

}
