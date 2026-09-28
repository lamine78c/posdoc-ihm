package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateContenuInputDTO {

    private Integer id;

    private String titre;

    private LocalDateTime dateActivation;

    private LocalDateTime dateExpiration;

    private String message;

    private List<CreateOrUpdateRegionInputDTO> regions;

}
