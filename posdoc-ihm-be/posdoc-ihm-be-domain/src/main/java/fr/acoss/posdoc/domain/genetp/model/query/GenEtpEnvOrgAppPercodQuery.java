package fr.acoss.posdoc.domain.genetp.model.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class GenEtpEnvOrgAppPercodQuery {
    String codenv;
    String codorg;
    String codapp;
    String percod;
}
