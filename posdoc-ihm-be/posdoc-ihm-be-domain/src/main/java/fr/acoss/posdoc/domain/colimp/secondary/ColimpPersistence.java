package fr.acoss.posdoc.domain.colimp.secondary;

import fr.acoss.posdoc.domain.colimp.model.Colimp;
import java.util.List;

public interface ColimpPersistence {
  List<Colimp> selectAll();
}
