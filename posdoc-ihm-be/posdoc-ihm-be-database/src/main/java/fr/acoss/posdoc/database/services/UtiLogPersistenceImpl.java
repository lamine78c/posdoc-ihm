package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.database.dao.UtiLogRepository;
import fr.acoss.posdoc.database.entities.UtiLogEntity;
import fr.acoss.posdoc.database.mappers.UtiLogMapper;
import fr.acoss.posdoc.domain.utilog.model.FindUtiLogByQuery;
import fr.acoss.posdoc.domain.utilog.model.FindUtiLogByQueryDateTime;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.secondary.UtiLogPersistence;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UtiLogPersistenceImpl extends AbstractObjectPersistence<UtiLogEntity, Integer, UtiLog>
        implements UtiLogPersistence {

    private final UtiLogRepository utiLogRepository;
    private static final UtiLogMapper MAPPER = UtiLogMapper.INSTANCE;


    public UtiLogPersistenceImpl(
            final UtiLogRepository utiLogRepository
    ){
        this.utiLogRepository = utiLogRepository;
    }

    @Override
    protected JpaSpecificationExecutor<UtiLogEntity> getSpecificationExecutor() {
        return this.utiLogRepository;
    }

    @Override
    protected JpaRepository<UtiLogEntity, Integer> getRepository() {
        return this.utiLogRepository;
    }

    @Override
    protected Function<UtiLogEntity, UtiLog> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<UtiLog, UtiLogEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public UtiLog insertOrUpdateUtilog(final UtiLog utiLog) {
        return MAPPER.entityToDomain(this.utiLogRepository.save(MAPPER.domainToEntity(utiLog)));
    }

    @Override
    public List<UtiLog> findUtiLogByQuery(final FindUtiLogByQuery query) {
        FindUtiLogByQueryDateTime params = new FindUtiLogByQueryDateTime();
        params.setDtdeb(DateUtils.dateTimeFormatterFromStringISO(query.getDtdeb()));
        params.setDtfin(DateUtils.dateTimeFormatterFromStringISO(query.getDtfin()));
        params.setAction(query.getAction());
        params.setForm(query.getForm());
        params.setUser(query.getUser());
        params.setResult(query.getResult());
        return utiLogRepository.findUtiLogByQuery(params).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<String> findDistinctUser() {
        return utiLogRepository.findDistinctUser();
    }

    @Override
    public List<String> findDistinctAction() {
        return utiLogRepository.findDistinctAction();
    }

    @Override
    public List<String> findDistinctFormId() {
        return utiLogRepository.findDistinctFormId();
    }

    @Override
    public List<Integer> findRowNotInMyslogToPurge(int days, int rowlimit) {
        LocalDateTime dateLimit = LocalDateTime.now().minusDays(days);
        PageRequest limitSize = PageRequest.of(0, rowlimit);
        return this.utiLogRepository.findRowNotInMyslogToPurge(dateLimit, limitSize);
    }

    @Override
    public void deleteByCoduloIn(Iterable<Integer> codulos) {
        this.utiLogRepository.deleteByCoduloIn(codulos);
    }
}
