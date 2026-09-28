package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.types.Paginated;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;

import java.util.function.Function;
import java.util.stream.Collectors;

@Mapper
public interface PaginatedMapper {

  PaginatedMapper INSTANCE = Mappers.getMapper(PaginatedMapper.class);

  default <T, R> Paginated<R> pageToPaginated(final Page<T> page, final Function<T, R> mapping) {
    final var paginated = new Paginated<R>();

    paginated.setTotalElement(page.getTotalElements());
    paginated.setTotalPages(page.getTotalPages());
    paginated.setElements(page.get().map(mapping).collect(Collectors.toList()));

    return paginated;
  }

}