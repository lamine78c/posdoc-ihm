package fr.acoss.posdoc.domain.compos.secondary;

import fr.acoss.posdoc.domain.compos.model.Compos;

import java.util.List;

public interface ComposPersistence {
  List<Compos> selectAll();
}
