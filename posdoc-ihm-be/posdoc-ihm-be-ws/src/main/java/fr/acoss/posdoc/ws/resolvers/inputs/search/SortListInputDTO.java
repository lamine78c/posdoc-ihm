package fr.acoss.posdoc.ws.resolvers.inputs.search;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SortListInputDTO {

    private List<SortInputDTO> sort;

}
