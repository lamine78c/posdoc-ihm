package fr.acoss.posdoc.domain.stainf.secondary;

import fr.acoss.posdoc.domain.stainf.model.StaInf;

import java.util.List;

public interface StaInfPersistence {

    List<StaInf> selectAll();
}
