package fr.acoss.posdoc.domain.genfic.model;

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
public class CreateOrUpdateBonTravailManuelPayload {
    private Boolean isedit;
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String numcom;
    private String codfic;
    private String typtar;
    private Integer pagfic;
    private Integer plific;
    private LocalDateTime dappcr;
    private String codsit;
    private String inform;
    private List<CreateOrUpdateBonTravailManuelNoticesPayload> notices;
    private List<String> oldnotices;
}
