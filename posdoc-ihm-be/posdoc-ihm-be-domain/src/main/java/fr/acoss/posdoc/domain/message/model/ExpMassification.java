package fr.acoss.posdoc.domain.message.model;

import fr.acoss.posdoc.domain.massification.model.BilanData;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class ExpMassification extends AdelaideMessage {
    private String typar;
    private Boolean isSimu;
    private String listeFic;
    private List<BilanData.BilanItem> bilanItems;
}
