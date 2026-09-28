package fr.acoss.posdoc.domain.utilog.primary;

import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.utilog.UtiLogUtil;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.secondary.UtiLogPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

public class UtiLogService {
    private final UtiLogPersistence utiLogPersistence;
    private final ParametrePersistence parametrePersistence;
    private static final Logger LOGGER = LoggerFactory.getLogger(UtiLogService.class);

    public UtiLogService(final UtiLogPersistence utiLogPersistence, final ParametrePersistence parametrePersistence) {
        this.utiLogPersistence = utiLogPersistence;
        this.parametrePersistence = parametrePersistence;
    }

    public UtiLog insertUtilog(final String error, final String params, final String action, final String host, final String user, final String formId) {
        return this.utiLogPersistence.insertOrUpdateUtilog(
                UtiLog
                        .builder()
                        .codusr(user)
                        .formid(UtiLogUtil.normaliseParam(formId))
                        .datulo(LocalDateTime.now())
                        .action(UtiLogUtil.normaliseParam(action))
                        .params(params == null ? null : UtiLogUtil.normaliseParam(params))
                        .codsta(host)
                        .versio(this.parametrePersistence.getAdelaideVersion())
                        .result(error == null)
                        .erreur(error == null ? UtiLogUtil.NO_ERR : UtiLogUtil.normaliseParam(error))
                        .build()
        );
    }

    public void purgeRowNotInMyslog(int days, int rowlimit) {
        LOGGER.info("Start purge utilog");
        List<Integer> ids = this.utiLogPersistence.findRowNotInMyslogToPurge(days, rowlimit);
        this.utiLogPersistence.deleteByCoduloIn(ids);
        LOGGER.info("End purge utilog");
    }
}
