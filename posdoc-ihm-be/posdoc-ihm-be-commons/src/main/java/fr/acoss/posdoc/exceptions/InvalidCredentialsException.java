package fr.acoss.posdoc.exceptions;

import java.util.Map;

public class InvalidCredentialsException extends PosdocException {

  private final String username;

  private final String password;

  public InvalidCredentialsException(final String username, final String password) {
    super("Invalid credentials");

    this.username = username;
    this.password = password;
  }

  public String getUsername() {
    return username;
  }

  public String getPassword() {
    return password;
  }

  @Override
  public Map<String, Object> getExtensions() {
    final var extensions = super.getExtensions();
    extensions.put("username", username);
    extensions.put("password", password);
    return extensions;
  }
}
