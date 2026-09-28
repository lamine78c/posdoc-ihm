package fr.acoss.posdoc.domain.expedition.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Expedition {
  private String codcom;
  private String codfic;
  private String numcom;
  private String codprd;
  private String refimp;
  private String codsit;
  private String codenv;
  private String codorg;
  private String codapp;
  private String percod;
  private String codcli;
  private Integer pagfic;
  private LocalDateTime dfiexp;
  private String libfic;
}
