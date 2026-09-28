package fr.acoss.posdoc.service.adelaide.impl.socket;

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
public class AdelaideResult {
    private String result;
    private String error;

}
