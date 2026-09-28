package fr.acoss.posdoc.domain.gendoc.secondary;


import fr.acoss.posdoc.domain.gendoc.model.DocDemOccurrenceApplication;
import fr.acoss.posdoc.domain.gendoc.model.DocDematerialise;
import fr.acoss.posdoc.domain.gendoc.model.DocVideoInformationDetail;
import fr.acoss.posdoc.domain.gendoc.model.GenDocOrgAppCom;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemOccurrenceApplicationQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoInfoDetailQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoQuery;

import java.util.List;

public interface GenDocPersistence {

    List<DocDematerialise> findByCriteres(SearchDocDemQuery query);
    List<DocDematerialise> findByVideoCriteres(SearchDocVideoQuery query);
    DocVideoInformationDetail findByVideoInfoDetailCriteres(SearchDocVideoInfoDetailQuery query);
    List<DocDemOccurrenceApplication> getDocDemOccurrenceApplication(SearchDocDemOccurrenceApplicationQuery query);
    List<GenDocOrgAppCom> getDistinctOrgAppComFromGendoc();
}
