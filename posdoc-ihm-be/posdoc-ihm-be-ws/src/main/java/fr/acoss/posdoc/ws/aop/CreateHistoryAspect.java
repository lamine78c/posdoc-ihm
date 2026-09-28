package fr.acoss.posdoc.ws.aop;

import fr.acoss.posdoc.database.dao.HistoryRepository;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.types.MyslogAction;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Aspect
@Component
public class CreateHistoryAspect {

    @Autowired
    HistoryRepository historyRepository;

    @AfterThrowing(pointcut = "execution(public * fr.acoss.posdoc.domain.client.primary.*.*(..))", throwing = "ex")
    public void log(JoinPoint joinPoint, Exception ex) {

        var methodeName = joinPoint.getSignature().getName();
        if (methodeName.contains("create"))
            saveHistory(MyslogAction.INSERT, methodeName.substring(6, 11), ex.getMessage());
        if (methodeName.contains("update"))
            saveHistory(MyslogAction.UPDATE, methodeName.substring(6, 11), ex.getMessage());
        if (methodeName.contains("delete"))
            saveHistory(MyslogAction.DELETE, methodeName.substring(6, 11), ex.getMessage());
    }

    /**
     * sauvegarde de laction
     *
     * @param type   type de l'action
     * @param entity entuty concerné
     * @param erreur erreur de l'exception
     */
    private void saveHistory(MyslogAction type, String entity, String erreur) {

        HistoryEntity history = new HistoryEntity();
        history.setInsertionDate(LocalDateTime.now());
        history.setActionUtilisateur(type);
        history.setEntite(entity);
        history.setStation("testStation");
        history.setUtilisateur("AC75096594");
        history.setSortie(erreur);
        //history.setErreur(ex.getMessage())
        historyRepository.save(history);
    }
}
