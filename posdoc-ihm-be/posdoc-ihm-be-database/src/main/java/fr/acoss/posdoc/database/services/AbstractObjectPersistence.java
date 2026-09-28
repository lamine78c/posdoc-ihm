package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.mappers.PaginatedMapper;
import fr.acoss.posdoc.database.search.GenericSearchSpecification;
import fr.acoss.posdoc.domain.common.search.FilterCriteria;
import fr.acoss.posdoc.domain.common.search.FilterCriteriaSort;
import fr.acoss.posdoc.domain.common.search.PaginationParameters;
import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.types.Direction;
import fr.acoss.posdoc.types.Paginated;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public abstract class AbstractObjectPersistence<E, I, D> {

  private static final PaginatedMapper PA_MAPPER = PaginatedMapper.INSTANCE;

  protected PageRequest pageRequestOf(final PaginationParameters paginationParameters) {

    final var sort = paginationParameters.getSort().stream().map(e -> new Sort.Order(
            e.getDirection() == Direction.ASCENDING ? Sort.Direction.ASC : Sort.Direction.DESC,
            e.getColumn())).collect(Collectors.toList());

    return PageRequest.of(paginationParameters.getPage(),
            paginationParameters.getSize(),
            Sort.by(sort));
  }

  public Paginated<D> select(final QueryParameters queryParameters) {
    final var servers = getSpecificationExecutor().findAll(new GenericSearchSpecification<>(
                    queryParameters.getFilterCriteria()),
            pageRequestOf(queryParameters.getPaginationParameters()));

    return PA_MAPPER.pageToPaginated(servers, entityToDomainFunction());
  }

  public List<D> selectAll(final FilterCriteriaSort filterCriteriaSort) {

    final var sort = filterCriteriaSort.getSortList().getSort().stream().map(e -> new Sort.Order(
            e.getDirection() == Direction.ASCENDING ? Sort.Direction.ASC : Sort.Direction.DESC,
            e.getColumn())).collect(Collectors.toList());

    final var servers =  getSpecificationExecutor().findAll(new GenericSearchSpecification<>(
            filterCriteriaSort.getFilterCriteria()), Sort.by(sort));
    return servers.stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  public List<D> selectAll(final FilterCriteria filterCriteria) {
    final var servers =  getSpecificationExecutor().findAll(new GenericSearchSpecification<>(
            filterCriteria));

    return servers.stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  //Par défaut le comportement du create et update sont les mêmes
  public D create(final D domain) {
    return update(domain);
  }

  public D update(final D domain){
    final var entity = domainToEntityFunction().apply(domain);
    return entityToDomainFunction().apply(getRepository().save(entity));
  }

  public void delete(final I id) {
    getRepository().deleteById(id);
  }

  public boolean exists(final I code) {
    return getRepository().existsById(code);
  }

  protected abstract JpaSpecificationExecutor<E> getSpecificationExecutor();

  protected abstract JpaRepository<E, I> getRepository();

  protected abstract Function<E, D> entityToDomainFunction();

  protected abstract Function<D, E> domainToEntityFunction();

}
