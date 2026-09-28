package fr.acoss.posdoc.prisme;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Setter
@Getter
public class PrismeClientInformations implements Serializable {
  //On met une valeur par défaut au cas ou il n'est pas transmis (cas test local)
  private String idClient = "UNKNOWN";
  private List<String> organismes = null;
}
