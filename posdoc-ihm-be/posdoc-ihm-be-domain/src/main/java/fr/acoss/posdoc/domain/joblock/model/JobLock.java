package fr.acoss.posdoc.domain.joblock.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class JobLock {

  private String name;

  private String server;

  private LocalDateTime date;

}
