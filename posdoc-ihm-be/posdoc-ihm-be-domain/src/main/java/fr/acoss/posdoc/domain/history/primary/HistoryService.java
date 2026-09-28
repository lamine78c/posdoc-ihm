package fr.acoss.posdoc.domain.history.primary;

import fr.acoss.posdoc.domain.history.secondary.HistoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class HistoryService {
    private final HistoryPersistence historyPersistence;
    private static final Logger LOGGER = LoggerFactory.getLogger(HistoryService.class);
    public HistoryService(final HistoryPersistence historyPersistence) {
        this.historyPersistence = historyPersistence;
    }

    public void purge(int days, int limit) {
        LOGGER.info("Start purge myslog");
        List<Integer> ids = this.historyPersistence.findRowToPurge(days, limit);
        this.historyPersistence.deleteByIdIn(ids);
        LOGGER.info("End purge myslog");
    }
}
