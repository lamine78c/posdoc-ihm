package fr.acoss.posdoc.ws.configuration;

import fr.acoss.posdoc.ws.error.GraphqlErrorResponse;
import graphql.GraphQLError;
import graphql.kickstart.execution.error.GraphQLErrorHandler;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedList;
import java.util.List;

/**
 * Permet d'avoir accès à l'ensemble des erreurs d'une requête GraphQL.
 * Ajoute le timestamp dans les extensions.
 */
@Component
public class GraphQLProcessErrorHandler implements GraphQLErrorHandler {

  private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

  @Override
  public List<GraphQLError> processErrors(final List<GraphQLError> errors) {

    final var formattedNow = LocalDateTime.now().format(FORMATTER);

    final var updatedErrors = new LinkedList<GraphQLError>();

    for (final GraphQLError error : errors) {
      final var graphQLErrorResponse = new GraphqlErrorResponse(error);
      graphQLErrorResponse.getExtensions().put("timestamp", formattedNow);

      updatedErrors.add(graphQLErrorResponse);
    }

    return updatedErrors;
  }

}
