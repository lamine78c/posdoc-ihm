package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "job_lock")
public class JobLockEntity {

  @Id
  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "server", nullable = false)
  private String server;

  @Column(name = "date", nullable = false)
  private LocalDateTime date;
}
