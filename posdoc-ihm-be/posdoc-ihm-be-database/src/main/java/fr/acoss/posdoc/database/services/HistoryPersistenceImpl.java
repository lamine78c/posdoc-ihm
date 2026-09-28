package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.database.dao.HistoryRepository;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.database.mappers.HistoryMapper;
import fr.acoss.posdoc.domain.history.model.FindHistoryByQuery;
import fr.acoss.posdoc.domain.history.model.FindHistoryByQueryDateTime;
import fr.acoss.posdoc.domain.history.model.History;
import fr.acoss.posdoc.domain.history.secondary.HistoryPersistence;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HistoryPersistenceImpl extends AbstractObjectPersistence<HistoryEntity, Integer, History>
    implements HistoryPersistence {

  private static final HistoryMapper MAPPER = HistoryMapper.INSTANCE;

  private final HistoryRepository historyRepository;

  public HistoryPersistenceImpl(
      HistoryRepository historyRepository) {this.historyRepository = historyRepository;}

  @Override
  protected JpaSpecificationExecutor<HistoryEntity> getSpecificationExecutor() {
    return historyRepository;
  }

  @Override
  protected JpaRepository<HistoryEntity, Integer> getRepository() {
    return null;
  }

  @Override
  protected Function<HistoryEntity, History> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<History, HistoryEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<History> selectAll() {
    return historyRepository.findAllByOrderByIdAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<History> findHistoryByQuery(FindHistoryByQuery query) {
    FindHistoryByQueryDateTime params = new FindHistoryByQueryDateTime();
    params.setDtdeb(DateUtils.dateTimeFormatterFromStringISO(query.getDtdeb()));
    params.setDtfin(DateUtils.dateTimeFormatterFromStringISO(query.getDtfin()));
    params.setAction(query.getAction());
    params.setEntity(query.getEntity());
    params.setUser(query.getUser());
    return historyRepository.findHistoryByQuery(params).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<String> findDistinctUser() {
    return historyRepository.findDistinctUser();
  }

  @Override
  public List<String> findDistinctEntity() {
    return historyRepository.findDistinctEntity();
  }

  @Override
  public List<History> findHistoryByCodulo(Integer codulo) {
    return historyRepository.findByCodulo(codulo).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<Integer> findRowToPurge(int days, int rowLimit) {
    LocalDateTime dateLimit = LocalDateTime.now().minusDays(days);
    PageRequest limitSize = PageRequest.of(0, rowLimit);
    return this.historyRepository.findRowToPurge(dateLimit, limitSize);
  }

  @Override
  public void deleteByIdIn(Iterable<Integer> ids) {
    this.historyRepository.deleteByIdIn(ids);
  }
}
