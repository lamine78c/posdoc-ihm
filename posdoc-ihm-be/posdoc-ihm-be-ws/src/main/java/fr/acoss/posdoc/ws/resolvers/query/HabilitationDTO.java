package fr.acoss.posdoc.ws.resolvers.query;


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
public class HabilitationDTO {

    private Integer id;

    private Integer parentId;

    private fr.acoss.posdoc.types.HabilitationType habilitationType;

    private String identite;

    private Integer ordre;
}
