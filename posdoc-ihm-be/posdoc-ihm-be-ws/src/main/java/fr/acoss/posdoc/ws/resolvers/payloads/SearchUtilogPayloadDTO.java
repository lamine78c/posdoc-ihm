package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SearchUtilogPayloadDTO {
  private Integer codulo;
  private String codsta;
  private String codusr;
  private String formid;
  private LocalDateTime datulo;
  private String action;
  private String params;
  private Boolean result;
  private String erreur;
  private String versio;
}
