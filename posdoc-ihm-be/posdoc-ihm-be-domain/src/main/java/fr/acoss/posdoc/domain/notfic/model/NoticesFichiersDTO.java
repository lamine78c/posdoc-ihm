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
public class NoticesFichiersDTO {
    private String codenv;
    private String codorg;
    private String codapp;
    private String codcom;
    private String codfic;
    private String codeProd;
    private String refImprime;
    private List<String> notices;
}
