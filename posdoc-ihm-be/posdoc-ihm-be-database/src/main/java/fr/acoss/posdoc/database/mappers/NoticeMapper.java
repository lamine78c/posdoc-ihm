package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.NoticeEntity;
import fr.acoss.posdoc.domain.notice.model.Notice;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface NoticeMapper {

  NoticeMapper INSTANCE = Mappers.getMapper(NoticeMapper.class);

  Notice entityToDomain(final NoticeEntity noticeEntity);

  NoticeEntity domainToEntity(final Notice notice);

}
