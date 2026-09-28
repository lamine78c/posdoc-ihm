package fr.acoss.posdoc.domain.genetp.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VolumesTraitesDTO {
    private List<VolumesTraites> volumesTraitesList;
    private String message;
}