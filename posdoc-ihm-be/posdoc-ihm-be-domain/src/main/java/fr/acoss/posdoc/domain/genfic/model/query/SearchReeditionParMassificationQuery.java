package fr.acoss.posdoc.domain.genfic.model.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class SearchReeditionParMassificationQuery {

    String codenv;
    List<String> codorg;
    String periode;
    String codcom;
    String codfic;
    String masapp;
    String masgam;
}
