package fr.acoss.posdoc.ws.configuration;

import fr.acoss.posdoc.exceptions.PosdocException;
import fr.acoss.posdoc.ws.error.GraphqlErrorResponse;
import graphql.execution.DataFetcherExceptionHandler;
import graphql.execution.DataFetcherExceptionHandlerParameters;
import graphql.execution.DataFetcherExceptionHandlerResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Permet de traiter l'ensemble des exceptions remontées par l'application et de les transformer en erreurs GraphQL
 */
public class GraphQLDataFetchingExceptionHandler implements DataFetcherExceptionHandler {

  private static final Logger LOGGER = LoggerFactory
      .getLogger(GraphQLDataFetchingExceptionHandler.class);

  @Override
  public DataFetcherExceptionHandlerResult onException(
      DataFetcherExceptionHandlerParameters handlerParameters) {

    final var exception = handlerParameters.getException();
    final var sourceLocation = handlerParameters.getSourceLocation();
    final var path = handlerParameters.getPath();

    if (exception instanceof PosdocException) {
      LOGGER.debug("Client exception thrown", exception);
    } else {
      LOGGER.error("Exception thrown", exception);
    }

    final var error = new GraphqlErrorResponse(path, exception, sourceLocation);

    return DataFetcherExceptionHandlerResult.newResult().error(error).build();
  }

}
