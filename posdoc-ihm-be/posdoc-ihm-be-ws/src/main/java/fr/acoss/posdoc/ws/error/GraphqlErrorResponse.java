package fr.acoss.posdoc.ws.error;

import fr.acoss.posdoc.exceptions.PosdocException;
import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.execution.ExecutionPath;
import graphql.language.SourceLocation;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static graphql.Assert.assertNotNull;

public class GraphqlErrorResponse implements GraphQLError {

  private static final String GENERIC_ERROR_MESSAGE = "Une erreur serveur est survenue";

  private final String message;

  private final transient List<Object> path;

  private final Throwable exception;

  private final List<SourceLocation> locations;

  private final transient Map<String, Object> extensions;

  private final transient ErrorClassification errorType;

  public GraphqlErrorResponse(final ExecutionPath path, final Throwable exception,
                              final SourceLocation sourceLocation) {
    this.path = assertNotNull(path).toList();
    this.exception = assertNotNull(exception);
    this.locations = Collections.singletonList(sourceLocation);
    this.extensions = buildExtensions(exception);
    this.message = buildMessage(exception);

    this.errorType = ErrorType.DataFetchingException;
  }

  public GraphqlErrorResponse(final GraphQLError error) {
    this.message = error.getMessage() ;
    this.locations = error.getLocations();
    this.errorType = error.getErrorType();
    this.extensions = error.getExtensions() != null ?
        new LinkedHashMap<>(error.getExtensions()) :
        new LinkedHashMap<>();
    this.path = error.getPath();

    //Unused
    this.exception = null;
  }

  private Map<String, Object> buildExtensions(final Throwable exception) {
    final Map<String, Object> result = new LinkedHashMap<>();

    //Si c'est une extension du type posdoc on ajoute les informations des exceptions (si nécessaires)
    if (exception instanceof PosdocException) {
      Map<String, Object> map = ((PosdocException) exception).getExtensions();
      if (map != null) {
        result.putAll(map);
      }
    }
    return result;
  }

  private String buildMessage(final Throwable exception) {

    if (exception instanceof PosdocException) {
      return exception.getMessage();
    }

    return GENERIC_ERROR_MESSAGE;
  }

  @Override
  public String getMessage() {
    return message;
  }

  @Override
  public List<SourceLocation> getLocations() {
    return locations;
  }

  @Override
  public ErrorClassification getErrorType() {
    return errorType;
  }

  @Override
  public Map<String, Object> getExtensions() {
    return extensions;
  }

  @Override
  public List<Object> getPath() {
    return path;
  }

  @Override
  public String toString() {
    return "ExceptionWhileDataFetching{" + "path=" + path + ", exception=" + exception
        + ", locations=" + locations + '}';
  }

}
