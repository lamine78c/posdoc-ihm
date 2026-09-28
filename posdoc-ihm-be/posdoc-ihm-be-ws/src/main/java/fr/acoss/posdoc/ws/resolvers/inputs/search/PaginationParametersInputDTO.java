package fr.acoss.posdoc.ws.resolvers.inputs.search;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class PaginationParametersInputDTO {

  private int page;

  private int size;

  private List<SortInputDTO> sort;

}
