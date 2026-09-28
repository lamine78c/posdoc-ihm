package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationFiltreDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.Map;

@Mapper
public interface SuiviMassificationMapper {

  SuiviMassificationMapper INSTANCE = Mappers.getMapper(SuiviMassificationMapper.class);

  SuiviMassificationFiltreDTO entityToSuiviMassificationFiltre(Map<String, String> map);

  SuiviMassificationDTO mapToSuiviMassification(Map<String, String> map);

}
