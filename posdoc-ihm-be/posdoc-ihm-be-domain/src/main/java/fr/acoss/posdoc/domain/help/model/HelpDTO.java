package fr.acoss.posdoc.domain.help.model;

import fr.acoss.posdoc.types.HelpStateType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class HelpDTO {

    private Integer id;

    private String path;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String message;

    private HelpStateType state;

    private String createdBy;

    private String updatedBy;
}