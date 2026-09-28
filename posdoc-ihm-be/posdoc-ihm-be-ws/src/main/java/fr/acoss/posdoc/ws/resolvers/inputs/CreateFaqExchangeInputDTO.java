package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateFaqExchangeInputDTO {

    private String message;

    private Integer faqId;
}
