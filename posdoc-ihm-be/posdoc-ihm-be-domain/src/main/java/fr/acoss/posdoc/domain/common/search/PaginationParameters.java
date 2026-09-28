package fr.acoss.posdoc.domain.common.search;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class PaginationParameters {

  private int page;

  private int size;

  private List<Sort> sort;

}
