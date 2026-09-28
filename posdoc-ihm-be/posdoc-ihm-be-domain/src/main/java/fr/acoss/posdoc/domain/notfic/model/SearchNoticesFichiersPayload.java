package fr.acoss.posdoc.domain.notfic.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SearchNoticesFichiersPayload {
    private String codenv;
    private List<String> codorg;
    private String codapp;
    private String codcom;
    private List<String> codfic;
    private String refimp;
}
