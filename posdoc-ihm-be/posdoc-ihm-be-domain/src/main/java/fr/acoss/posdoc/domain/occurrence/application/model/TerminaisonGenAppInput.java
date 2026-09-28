package fr.acoss.posdoc.domain.occurrence.application.model;

import fr.acoss.posdoc.domain.message.model.AdelaideMessage;
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
public class TerminaisonGenAppInput extends AdelaideMessage {
    private Boolean isAnnule;
}
