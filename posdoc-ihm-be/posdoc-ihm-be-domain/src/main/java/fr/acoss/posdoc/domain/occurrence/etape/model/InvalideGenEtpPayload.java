package fr.acoss.posdoc.domain.occurrence.etape.model;

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
public class InvalideGenEtpPayload {
    private Integer idetap;
    private String user;
    private String formid;
}
