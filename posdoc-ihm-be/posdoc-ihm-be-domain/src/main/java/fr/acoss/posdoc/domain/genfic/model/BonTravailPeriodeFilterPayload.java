package fr.acoss.posdoc.domain.genfic.model;

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
public class BonTravailPeriodeFilterPayload {
    private String codenv;
    private List<String> codorg;
    private String codapp;
}
