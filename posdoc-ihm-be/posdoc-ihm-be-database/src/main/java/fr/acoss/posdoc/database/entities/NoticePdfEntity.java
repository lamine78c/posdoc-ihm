package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "notice_pdf")
public class NoticePdfEntity {

    @Id
    @Column(name = "codnot", nullable = false, length = 12)
    private String codnot;

    @Column(name = "pdf_file_path", nullable = false)
    private String pdfFilePath;

    @Column(name = "upload_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadDate;
}