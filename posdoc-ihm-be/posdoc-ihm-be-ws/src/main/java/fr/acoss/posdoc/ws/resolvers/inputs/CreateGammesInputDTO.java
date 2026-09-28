package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateGammesInputDTO {
    private List<CreateOrUpdateGammeInputDTO> gammes;
}
