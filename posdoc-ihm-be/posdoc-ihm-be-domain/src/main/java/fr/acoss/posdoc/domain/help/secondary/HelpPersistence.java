package fr.acoss.posdoc.domain.help.secondary;

import fr.acoss.posdoc.domain.help.model.Help;
import fr.acoss.posdoc.types.HelpStateType;

import java.util.List;
import java.util.Optional;

public interface HelpPersistence {

    List<Help> selectAll();

    List<Help> getHelpByPath(String path);

    Optional<Help> getHelpById(Integer id);

    Help create(Help help);

    Help update(Help help);

    void delete(Integer code);

    boolean exists(Integer id);

    Optional<Help> selectAllByPathAndState(String path, HelpStateType status);
}
