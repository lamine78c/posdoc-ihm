package fr.acoss.posdoc.types;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Paginated<T> {

  private List<T> elements;

  private long totalElement;

  private int totalPages;

}
