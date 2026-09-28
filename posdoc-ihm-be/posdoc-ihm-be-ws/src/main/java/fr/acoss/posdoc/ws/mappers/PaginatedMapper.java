package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.types.Paginated;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.function.Function;
import java.util.stream.Collectors;

@Mapper
public interface PaginatedMapper {

  PaginatedMapper INSTANCE = Mappers.getMapper(PaginatedMapper.class);

  default <T> PaginatedDTO paginatedToPaginatedDTO(final Paginated<T> paginated,
                                                   final Function<T, Object> mapping) {
    final var paginatedDTO = new PaginatedDTO();

    paginatedDTO.setTotalElement(paginated.getTotalElement());
    paginatedDTO.setTotalPages(paginated.getTotalPages());
    paginatedDTO.setElements(paginated.getElements().stream().map(mapping)
        .collect(Collectors.toList()));

    return paginatedDTO;
  }

}