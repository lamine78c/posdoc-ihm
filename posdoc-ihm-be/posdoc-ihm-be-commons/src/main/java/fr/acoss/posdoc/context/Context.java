package fr.acoss.posdoc.context;

import fr.acoss.posdoc.model.Role;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Context {
    @Builder.Default
    private String host = " ";

    @Builder.Default
    private String user = "UNKNOWN";

    @Builder.Default
    private Role profile = Role.UNKNOWN;

    @Builder.Default
    private Integer id = null;

    public void setProfileFromString(String roleStr) {
        this.profile = Role.fromString(roleStr);
    }
}
