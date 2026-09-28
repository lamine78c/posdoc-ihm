package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class PaginatedDTO {

  private List<Object> elements;

  private long totalElement;

  private int totalPages;

}
