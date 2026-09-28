package fr.acoss.posdoc.domain.message.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GenericAdelaideMessage implements IAdelaideMessage{
    private String message;
}
