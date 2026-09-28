package fr.acoss.posdoc.ws.resolvers.inputs;

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
public class CreateOrUpdateRegionsInputDTO {
    private List<CreateOrUpdateRegionInputDTO> regions;
}
