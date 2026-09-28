package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "Utilis")
public class UtilisateurEntity {

  @Id
  @Column(name = "c99_codusr", nullable = false)
  private String codeUtilisateur;

  @Column(name = "s99_libusr", nullable = false)
  private String libelleUtilisateur;

  @Column(name = "s99_profil", nullable = false)
  private String profile;

  @Column(name = "s99_passwd", nullable = false)
  private String password;

  @Column(name = "b99_actif", nullable = false)
  private Integer actif;

  @Column(name = "s99_codenv", nullable = false)
  private String codeEnvironnement;

  @Column(name = "s99_codsit")
  private String codeSite;

  public String getCodeUtilisateur() {
    return codeUtilisateur;
  }

  public void setCodeUtilisateur(String codeUtilisateur) {
    this.codeUtilisateur = codeUtilisateur;
  }

  public String getLibelleUtilisateur() {
    return libelleUtilisateur;
  }

  public void setLibelleUtilisateur(String libelleUtilisateur) {
    this.libelleUtilisateur = libelleUtilisateur;
  }

  public String getProfile() {
    return profile;
  }

  public void setProfile(String profile) {
    this.profile = profile;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Integer getActif() {
    return actif;
  }

  public void setActif(Integer actif) {
    this.actif = actif;
  }

  public String getCodeEnvironnement() {
    return codeEnvironnement;
  }

  public void setCodeEnvironnement(String codeEnvironnement) {
    this.codeEnvironnement = codeEnvironnement;
  }

  public String getCodeSite() {
    return codeSite;
  }

  public void setCodeSite(String codeSite) {
    this.codeSite = codeSite;
  }
}
