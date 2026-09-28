package fr.acoss.posdoc.domain.help.model;

import fr.acoss.posdoc.types.HelpStateType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Help {

    private Integer id;

    private String path;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String message;

    private HelpStateType state;

    private String createdBy;

    private String updatedBy;
}
