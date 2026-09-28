package fr.acoss.posdoc.domain.genapp.model;

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
public class DetailsPeriode {
    private String perCod;
    private String appsta;
    private LocalDateTime dappld;
    private LocalDateTime dapplt;
    private Boolean manuel;
}