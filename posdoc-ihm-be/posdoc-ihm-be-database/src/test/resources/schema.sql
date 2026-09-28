CREATE TABLE IF NOT EXISTS ORGANI(
  C00_Codorg char(3) NOT NULL DEFAULT '',
  S00_Liborg varchar(50) NOT NULL DEFAULT '',
  S00_Adres1 varchar(38) DEFAULT NULL,
  S00_Adres2 varchar(38) DEFAULT NULL,
  S00_Adres3 varchar(38) DEFAULT NULL,
  S00_Adres4 varchar(38) DEFAULT NULL,
  S00_Typorg char(1) NOT NULL DEFAULT 'R',
  S00_Codreg char(3) DEFAULT NULL,
  S00_Codsit varchar(6) NOT NULL,
  PRIMARY KEY (C00_Codorg)
);

CREATE TABLE IF NOT EXISTS INFO_ORGANISME
(
    INFO_ORGANISME_ID INTEGER NOT NULL,
    CODE_ORGANISME CHAR(3) NOT NULL REFERENCES ORGANI(C00_Codorg),
    MESSAGE VARCHAR(250) NOT NULL,
    ACTIF BOOLEAN NOT NULL,
    DATE TIMESTAMP NOT NULL,
    PRIMARY KEY (INFO_ORGANISME_ID)
);

CREATE SEQUENCE IF NOT EXISTS INFO_ORGANISME_SEQ
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TABLE IF NOT EXISTS ENVIRO (
  C01_Codenv char(1) NOT NULL DEFAULT '',
  S01_Libenv char(50) NOT NULL DEFAULT '',
  PRIMARY KEY (C01_Codenv)
);

CREATE TABLE IF NOT EXISTS Gammes (
C06_Codgam varchar(2) NOT NULL DEFAULT '',
S06_Libgam varchar(50) NOT NULL DEFAULT '',
S06_Codver varchar(8) DEFAULT NULL,
PRIMARY KEY (C06_Codgam)
);

CREATE INDEX IF NOT EXISTS IndexVerrou_Gammes ON Gammes (S06_Codver);

CREATE TABLE IF NOT EXISTS Server (
C03_Codser varchar(8) NOT NULL DEFAULT '',
S03_Codsys char(1) NOT NULL DEFAULT '',
S03_Libser varchar(50) NOT NULL DEFAULT '',
S03_Adreip varchar(32) DEFAULT NULL,
B03_Sertst smallint NOT NULL DEFAULT '1',
B03_Seract smallint NOT NULL DEFAULT '1',
PRIMARY KEY (C03_Codser)
);

CREATE INDEX IF NOT EXISTS IndexSysexp_Server ON Server (S03_Codsys);

CREATE TABLE IF NOT EXISTS Client (
C47_Codcli varchar(8) NOT NULL DEFAULT '',
S47_Libcli varchar(50) NOT NULL DEFAULT '',
S47_Codalg varchar(2) NOT NULL DEFAULT '',
PRIMARY KEY (C47_Codcli)
);

CREATE TABLE IF NOT EXISTS Tarifs (
C44_Typtar varchar(3) NOT NULL DEFAULT '',
C44_Numtar varchar(4) NOT NULL DEFAULT '',
D44_Dtarid date DEFAULT NULL,
D44_Dtarif date DEFAULT NULL,
N44_Coupli numeric(5,0) NOT NULL DEFAULT '0',
B44_Optar1 smallint NOT NULL DEFAULT '0',
B44_Optar2 smallint NOT NULL DEFAULT '0',
B44_Optar3 smallint NOT NULL DEFAULT '0',
B44_Urgent smallint NOT NULL DEFAULT '0',
PRIMARY KEY (C44_Typtar,C44_Numtar)
);

CREATE TABLE IF NOT EXISTS Params (
C32_Codpar varchar(6) NOT NULL DEFAULT '',
S32_Valpar varchar(50) NOT NULL DEFAULT '',
S32_Libpar varchar(50) DEFAULT NULL,
PRIMARY KEY (C32_Codpar)
);

CREATE TABLE IF NOT EXISTS Parres (
C36_Refdis varchar(12) NOT NULL DEFAULT '',
S36_Libdis varchar(50) NOT NULL DEFAULT '',
S36_Logtrf char(1) NOT NULL DEFAULT '',
S36_Comdis text ,
PRIMARY KEY (C36_Refdis)
);

CREATE TABLE IF NOT EXISTS parcle (
c37_refcle varchar(8) NOT NULL DEFAULT '',
s37_typfor varchar(3) NOT NULL DEFAULT '',
s37_libcle varchar(50) NOT NULL DEFAULT '',
n37_numlig numeric(3,0) NOT NULL DEFAULT '0',
n37_numcol numeric(3,0) NOT NULL DEFAULT '0',
n37_lgncle numeric(3,0) NOT NULL DEFAULT '0',
PRIMARY KEY (c37_refcle)
);

CREATE TABLE IF NOT EXISTS Verrou (
C75_Codver varchar(8) NOT NULL DEFAULT '',
S75_Libver varchar(50) NOT NULL DEFAULT '',
N75_Maxexe numeric(3,0) NOT NULL DEFAULT '0',
PRIMARY KEY (C75_Codver)
);

CREATE TABLE IF NOT EXISTS Region (
C62_Codreg varchar(3) NOT NULL DEFAULT '',
S62_Libreg varchar(50) NOT NULL DEFAULT '',
PRIMARY KEY (C62_Codreg)
);

CREATE TABLE IF NOT EXISTS Sitorg (
C74_Codorg varchar(3) NOT NULL DEFAULT '',
S74_Sitatt varchar(6) NOT NULL DEFAULT '',
S74_Sitscr varchar(6) NOT NULL DEFAULT '',
PRIMARY KEY (C74_Codorg)
);

CREATE TABLE IF NOT EXISTS Sitcnp (
C73_Codsit varchar(6) NOT NULL DEFAULT '',
S73_Hostad varchar(50) NOT NULL DEFAULT '',
S73_Userid varchar(12) NOT NULL DEFAULT '',
S73_Passwd varchar(12) NOT NULL DEFAULT '',
S73_Resdel varchar(8) NOT NULL DEFAULT NULL,
S73_Masorg varchar(3) NOT NULL DEFAULT NULL,
PRIMARY KEY (C73_Codsit)
);

CREATE TABLE IF NOT EXISTS Suppor (
C18_Typsup char(1) NOT NULL DEFAULT '',
S18_Libsup varchar(50) NOT NULL DEFAULT '',
N18_Poific numeric(6,0) NOT NULL DEFAULT '0',
PRIMARY KEY (C18_Typsup)
);

CREATE TABLE IF NOT EXISTS compos (
C20_Typmef char(1) NOT NULL,
S20_Libmef varchar(50) NOT NULL,
PRIMARY KEY (C20_Typmef)
);

CREATE TABLE IF NOT EXISTS Imprim (
C40_Refimp varchar(8) NOT NULL DEFAULT '',
S40_Libimp varchar(50) NOT NULL DEFAULT '',
S40_Codrnd varchar(14) DEFAULT '',
S40_Typmef char(1) NOT NULL DEFAULT '-',
S40_Typcol char(1) NOT NULL DEFAULT '-',
B40_Recver smallint NOT NULL DEFAULT '0',
PRIMARY KEY (C40_Refimp)
);

CREATE TYPE IF NOT EXISTS Parech_Typech AS enum('L','P');
CREATE TABLE IF NOT EXISTS Parech (
C38_Refech varchar(8) NOT NULL DEFAULT '',
S38_Typech Parech_Typech NOT NULL  DEFAULT 'L',
N38_Nbrlot numeric(3,0) DEFAULT '0',
N38_Nbrpag numeric(3,0) DEFAULT '0',
B38_Random smallint NOT NULL DEFAULT '0',
S38_Formul varchar(100) DEFAULT NULL,
PRIMARY KEY (C38_Refech)
);

CREATE TYPE IF NOT EXISTS myslog_action AS ENUM
    ('UPDATE', 'INSERT', 'DELETE');

CREATE TABLE IF NOT EXISTS myslog (
c37_codlog INTEGER NOT NULL,
s37_codsta character varying(32) NOT NULL DEFAULT '',
s37_codusr character varying(12) NOT NULL DEFAULT '',
d37_create timestamp without time zone,
s37_action myslog_action NOT NULL DEFAULT 'UPDATE'::myslog_action,
s37_entite character varying(6) NOT NULL DEFAULT '',
s37_mywher character varying(255) DEFAULT NULL,
s37_setpre text,
s37_setsuc text,
s37_codulo numeric(10,0) DEFAULT NULL,
s37_versio character varying(6) DEFAULT NULL,
CONSTRAINT myslog_pkey PRIMARY KEY (c37_codlog)
);

CREATE SEQUENCE IF NOT EXISTS myslog_c37_codlog_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TABLE IF NOT EXISTS ressou
(
    c08_codenv character(1) NOT NULL DEFAULT '',
    c08_codorg character varying(3) NOT NULL DEFAULT '',
    c08_codapp character varying(4) NOT NULL DEFAULT '',
    c08_codgam character varying(2) NOT NULL DEFAULT '',
    c08_codsit character varying(6) NOT NULL DEFAULT NULL,
    c08_codres character varying(8) NOT NULL DEFAULT '',
    s08_codser character varying(8) NOT NULL DEFAULT '',
    s08_libres character varying(50) NOT NULL DEFAULT '',
    s08_typres character(1) NOT NULL DEFAULT '',
    s08_logtrf character(1)   NOT NULL DEFAULT '',
    s08_compro character varying(12) NOT NULL DEFAULT '',
    s08_comlia character varying(12) NOT NULL DEFAULT '',
    s08_userid character varying(12)  DEFAULT NULL,
    s08_passwd character varying(12)  DEFAULT NULL,
    s08_typfus character(1) NOT NULL DEFAULT '',
    b08_fusdes smallint NOT NULL DEFAULT '0',
    s08_filimp character varying(12)  DEFAULT NULL,
    s08_infuti character varying(25)  DEFAULT NULL,
    b08_bloque smallint NOT NULL DEFAULT '0',
    b08_resmsp smallint NOT NULL DEFAULT '0',
    s08_profil character varying(4)  DEFAULT NULL,
    CONSTRAINT ressou_pkey PRIMARY KEY (c08_codenv, c08_codorg, c08_codapp, c08_codgam, c08_codsit, c08_codres)
);

CREATE TABLE IF NOT EXISTS exempl (
    c11_codenv CHAR NOT NULL DEFAULT '',
    c11_codorg VARCHAR(3) NOT NULL DEFAULT '',
    c11_codapp VARCHAR(4) NOT NULL DEFAULT '',
    c11_codcom VARCHAR(4) NOT NULL DEFAULT '',
    c11_codfic VARCHAR(5) NOT NULL DEFAULT '',
    c11_codgam VARCHAR(2) NOT NULL DEFAULT '',
    c11_numexe VARCHAR(2) NOT NULL DEFAULT '',
    s11_codsit VARCHAR(6) NOT NULL DEFAULT '',
    s11_codres VARCHAR(8) NOT NULL DEFAULT '',
    s11_coddes VARCHAR(8) NOT NULL DEFAULT '',
    n11_nbrexe NUMERIC(2) DEFAULT NULL,
    b11_exeact SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT exempl_pkey PRIMARY KEY (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe)
    );

CREATE TYPE IF NOT EXISTS fichie_typsig AS ENUM
    ('R', 'V');

CREATE TABLE IF NOT EXISTS fichie
(
    c07_codenv character(1) NOT NULL DEFAULT '',
    c07_codorg character varying(3) NOT NULL DEFAULT '',
    c07_codapp character varying(4) NOT NULL DEFAULT '',
    c07_codcom character varying(4) NOT NULL DEFAULT '',
    c07_codfic character varying(5) NOT NULL DEFAULT '',
    s07_libfic character varying(80) NOT NULL DEFAULT '',
    s07_typfor character(1) NOT NULL DEFAULT '',
    s07_typsup character(1) NOT NULL DEFAULT '',
    s07_typmul character(1) NOT NULL DEFAULT '',
    s07_reffor character varying(8)  DEFAULT NULL,
    s07_refimp character varying(8)  DEFAULT NULL,
    s07_refsup character varying(8)  DEFAULT NULL,
    s07_reftri character varying(8)  DEFAULT NULL,
    s07_refech character varying(8)  DEFAULT NULL,
    s07_refecl character varying(8)  DEFAULT NULL,
    n07_nbrrep numeric(2,0) NOT NULL DEFAULT '1',
    s07_ficatt character varying(50)  DEFAULT NULL,
    s07_verloc character varying(2)  DEFAULT NULL,
    n07_maxpag numeric(2,0) NOT NULL DEFAULT '5',
    b07_specim smallint NOT NULL DEFAULT '0',
    b07_cbadre smallint NOT NULL DEFAULT '0',
    b07_ediver smallint NOT NULL DEFAULT '0',
    b07_banimp smallint NOT NULL DEFAULT '1',
    b07_appbac smallint NOT NULL DEFAULT '0',
    s07_codadr character varying(8) DEFAULT NULL,
    s07_codprd character varying(5) DEFAULT NULL,
    n07_repexp numeric(2,0) NOT NULL DEFAULT '1',
    s07_typsig fichie_typsig NOT NULL DEFAULT 'R',
    s07_codcli character varying(8) DEFAULT NULL,
    s07_coddoc character varying(8) DEFAULT NULL,
    b07_eclate smallint NOT NULL DEFAULT '0',
    CONSTRAINT fichie_pkey PRIMARY KEY (c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic)
);

CREATE TABLE IF NOT EXISTS comman (
    c05_codenv char(1)         NOT NULL DEFAULT '',
    c05_codorg varchar(3)   NOT NULL DEFAULT '',
    c05_codapp varchar(4)   NOT NULL DEFAULT '',
    c05_codcom varchar(4)   NOT NULL DEFAULT '',
    s05_libcom varchar(50) NOT NULL DEFAULT '',
    PRIMARY KEY (c05_codenv, c05_codorg, c05_codapp, c05_codcom)
);

CREATE TABLE IF NOT EXISTS produi
(
    c09_codenv character(1) NOT NULL DEFAULT '',
    c09_codorg character varying(3) NOT NULL DEFAULT '',
    c09_codapp character varying(4) NOT NULL DEFAULT '',
    c09_codcom character varying(4) NOT NULL DEFAULT '',
    c09_codfic character varying(5) NOT NULL DEFAULT '',
    c09_codgam character varying(2) NOT NULL DEFAULT '',
    b09_proact smallint NOT NULL DEFAULT '1',
    PRIMARY KEY (c09_codenv, c09_codorg, c09_codapp, c09_codcom, c09_codfic, c09_codgam)
);

CREATE TABLE IF NOT EXISTS public.contenu
(
    id integer NOT NULL,
    titre character varying(50),
    message text,
    activation timestamp without time zone,
    expiration timestamp without time zone,
    CONSTRAINT contenu_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.contenus_regions
(
    contenu_id integer NOT NULL,
    region_code character varying(3) NOT NULL,
    PRIMARY KEY (contenu_id, region_code)
);

CREATE SEQUENCE IF NOT EXISTS CONTENU_ID_SEQ
    START WITH 3
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TABLE IF NOT EXISTS applis
(
    c04_codenv character(1) NOT NULL DEFAULT '',
    c04_codorg character varying(3) NOT NULL DEFAULT '',
    c04_codapp character varying(4) NOT NULL DEFAULT '',
    s04_codsys character(1) NOT NULL DEFAULT '',
    s04_libapp character varying(50) NOT NULL DEFAULT '',
    s04_typref character(1) NOT NULL DEFAULT '',
    s04_codgrp character varying(8) DEFAULT NULL ,
    s04_numlot character varying(5) DEFAULT NULL ,
    PRIMARY KEY (c04_codenv, c04_codorg, c04_codapp)
);

CREATE TABLE IF NOT EXISTS destin
(
    c10_codorg character varying(3) NOT NULL DEFAULT '',
    c10_coddes character varying(8) NOT NULL DEFAULT '',
    s10_libdes character varying(50) NOT NULL DEFAULT '',
    s10_refpri character varying(12) DEFAULT NULL,
    PRIMARY KEY (c10_codorg, c10_coddes)
);


 CREATE TABLE IF NOT EXISTS public.genfic
 (
     c15_codenv char          default ''              not null,
     c15_codorg varchar(3)    default ''    not null,
     c15_codapp varchar(4)    default ''    not null,
     c15_percod varchar(9)    default ''    not null,
     c15_codcom varchar(4)    default ''    not null,
     c15_numcom varchar(2)    default ''    not null,
     c15_codfic varchar(5)    default ''    not null,
     s15_ficsta char          default ''              not null,
     s15_ficinf varchar(3)    default NULL,
     b15_frefec smallint      default '0'            not null,
     d15_dfichc timestamp,
     d15_dfichd timestamp,
     d15_dficht timestamp,
     d15_dfichs timestamp,
     d15_dfichh timestamp,
     b15_ficvid smallint      default '0'            not null,
     s15_libfic varchar(80)   default ''    not null,
     s15_typfor char          default ''              not null,
     s15_typsup char          default ''              not null,
     s15_typmul char          default ''              not null,
     s15_reffor varchar(8)    default NULL,
     s15_refimp varchar(8)    default NULL,
     s15_refsup varchar(8)    default NULL,
     s15_reftri varchar(8)    default NULL,
     s15_refech varchar(8)    default NULL,
     s15_refecl varchar(8)    default NULL,
     n15_nbrrep numeric(2)    default '1'             not null,
     s15_ficatt varchar(50)   default NULL,
     s15_verimp varchar(2)    default NULL,
     n15_maxpag numeric(2)    default '5'             not null,
     b15_specim smallint      default '0'            not null,
     b15_cbadre smallint      default '0'            not null,
     b15_ediver smallint      default '0'            not null,
     b15_banimp smallint      default '1'            not null,
     b15_appbac smallint      default '0'            not null,
     d15_dfiexp date,
     s15_codprd varchar(5)    default NULL,
     d15_dappcr timestamp,
     n15_repexp numeric(2)    default '1'             not null,
     s15_masuti varchar(50)   default NULL,
     s15_codrnd varchar(14)   default '',
     s15_typsig varchar default '' not null,
     n15_pagfic numeric(8)    default '0'             not null,
     n15_plific numeric(6)    default '0'             not null,
     n15_rejfic numeric(6)    default '0'             not null,
     s15_codcli varchar(8)    default NULL,
     s15_typtar varchar(3)    default NULL,
     n15_codpal numeric(3)    default NULL,
     s15_codbon varchar(9)    default NULL,
     d15_drecep timestamp,
     s15_inform varchar(80)   default NULL,
     n15_delmsp numeric(2)    default NULL,
     s15_codsit varchar(6)    default NULL,
     b15_eclate smallint      default '0'            not null,
     primary key (c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic)
 );

CREATE TABLE IF NOT EXISTS genmas
  (
      c31_masenv character(1) NOT NULL DEFAULT '',
      c31_masorg character varying(3) NOT NULL DEFAULT '',
      c31_masapp character varying(4) NOT NULL DEFAULT '',
      c31_masper character varying(9) NOT NULL DEFAULT '',
      c31_mascom character varying(4) NOT NULL DEFAULT '',
      c31_masnum character varying(2) NOT NULL DEFAULT '',
      c31_masfic character varying(5) NOT NULL DEFAULT '',
      c31_codenv character(1)          NOT NULL DEFAULT '',
      c31_codorg character varying(3) NOT NULL DEFAULT '',
      c31_codapp character varying(4) NOT NULL DEFAULT '',
      c31_percod character varying(9) NOT NULL DEFAULT '',
      c31_codcom character varying(4) NOT NULL DEFAULT '',
      c31_numcom character varying(2) NOT NULL DEFAULT '',
      c31_codfic character varying(5) NOT NULL DEFAULT '',
      CONSTRAINT genmas_pkey PRIMARY KEY (c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic, c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
  );

CREATE TABLE IF NOT EXISTS public.gentar
(
    c45_codenv CHAR(1) NOT NULL DEFAULT '',
    c45_codorg VARCHAR(3) NOT NULL DEFAULT '',
    c45_codapp VARCHAR(4) NOT NULL DEFAULT '',
    c45_percod VARCHAR(9) NOT NULL DEFAULT '',
    c45_codcom VARCHAR(4) NOT NULL DEFAULT '',
    c45_numcom VARCHAR(2) NOT NULL DEFAULT '',
    c45_codfic VARCHAR(5) NOT NULL DEFAULT '',
    c45_typtar VARCHAR(3) NOT NULL DEFAULT '',
    n45_nbplis numeric(6,0) NOT NULL DEFAULT '0',
    n45_coutot numeric(10,0) NOT NULL DEFAULT '0',
    PRIMARY KEY (c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar)
);

CREATE TABLE IF NOT EXISTS genpro
(
    c16_codenv char       NOT NULL DEFAULT '',
    c16_codorg varchar(3) NOT NULL DEFAULT '',
    c16_codapp varchar(4) NOT NULL DEFAULT '',
    c16_percod varchar(9) NOT NULL DEFAULT '',
    c16_codcom varchar(4) NOT NULL DEFAULT '',
    c16_numcom varchar(2) NOT NULL DEFAULT '',
    c16_codfic varchar(5) NOT NULL DEFAULT '',
    c16_codgam varchar(2) NOT NULL DEFAULT '',
    s16_prosta char       NOT NULL DEFAULT '',
    s16_proinf varchar(3) DEFAULT NULL,
    b16_prefec smallint   NOT NULL DEFAULT '0',
    d16_dprodc timestamp,
    d16_dprodd timestamp,
    d16_dprodt timestamp,
    d16_dprods timestamp,
    d16_dprodh timestamp,
    n16_pagfic numeric(8) NOT NULL DEFAULT '0',
    n16_plific numeric(6) NOT NULL DEFAULT '0',
    n16_rejfic numeric(6) NOT NULL DEFAULT '0',
    primary key (c16_codenv, c16_codorg, c16_codapp, c16_percod, c16_codcom, c16_numcom, c16_codfic, c16_codgam)
);

CREATE TABLE IF NOT EXISTS gendoc
(
    c56_datdem character varying(8) NOT NULL DEFAULT ''::character varying,
    c56_numdem numeric(7,0) NOT NULL DEFAULT '0'::numeric,
    s56_codenv character(1) NOT NULL DEFAULT ''::char,
    s56_codorg character varying(3) DEFAULT NULL::character varying,
    s56_codapp character varying(4) DEFAULT NULL::character varying,
    s56_percod character varying(9) DEFAULT NULL::character varying,
    s56_numcom character varying(2) DEFAULT NULL::character varying,
    s56_codcom character varying(4) DEFAULT NULL::character varying,
    s56_codfic character varying(5) DEFAULT NULL::character varying,
    s56_coddoc character varying(8) NOT NULL DEFAULT ''::character varying,
    s56_refdem character varying(36) NOT NULL DEFAULT ''::character varying,
    s56_typact character(1) NOT NULL DEFAULT ''::char,
    b56_imprim smallint NOT NULL DEFAULT '0'::smallint,
    s56_docsta character(1) NOT NULL DEFAULT ''::char,
    s56_docinf character varying(2) DEFAULT NULL::character varying,
    d56_ddodeb timestamp without time zone,
    d56_ddofin timestamp without time zone,
    d56_ddosus timestamp without time zone,
    n56_tpscom numeric(4,0) NOT NULL DEFAULT '0'::numeric,
    b56_retour smallint NOT NULL DEFAULT '0'::smallint,
    d56_ddoimp timestamp without time zone,
    d56_ddoexp date,
    CONSTRAINT gendoc_pkey PRIMARY KEY (c56_datdem, c56_numdem)
);

CREATE TYPE IF NOT EXISTS genetp_typetp AS ENUM
    ('DEB', 'FIN', 'IDT', 'FAB', 'DIS', 'BIL', 'MSP');
CREATE SEQUENCE IF NOT EXISTS GENETP_C59_IDETAP_SEQ
    START WITH 2
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.genetp
(
    c59_idetap integer  DEFAULT 1,
    s59_typetp genetp_typetp DEFAULT 'DEB',
    s59_codenv character(1)   DEFAULT '',
    s59_codorg character varying(3)  DEFAULT '',
    s59_codapp character varying(4)  DEFAULT '',
    s59_percod character varying(9)  DEFAULT '',
    s59_codcom character varying(4)  DEFAULT '',
    s59_numcom character varying(2)  DEFAULT '',
    s59_codfic character varying(5)  DEFAULT '',
    s59_codgam character varying(2)  DEFAULT NULL,
    s59_numexe character varying(2)  DEFAULT NULL,
    s59_codres character varying(8)  DEFAULT NULL,
    s59_codsit character varying(6)  DEFAULT NULL,
    s59_coddes character varying(8)  DEFAULT NULL,
    n59_nbrexe numeric(2,0)  DEFAULT '0',
    s59_codser character varying(16)  DEFAULT NULL,
    s59_codsig character varying(3)  DEFAULT '-',
    s59_signal character varying(100)  DEFAULT '-',
    b59_reedit smallint  DEFAULT '0',
    b59_fabsim smallint DEFAULT '0',
    s59_statut character(1)  DEFAULT 'C',
    n59_codinf numeric(3,0) DEFAULT '0',
    d59_create timestamp ,
    d59_valide timestamp ,
    d59_debute timestamp ,
    d59_termin timestamp ,
    d59_invali timestamp ,
    d59_suspen timestamp ,
    d59_histor timestamp ,
    s59_script character varying(128)  DEFAULT NULL,
    n59_stepno numeric(4,0)  DEFAULT '0',
    n59_numpid numeric(10,0)  DEFAULT '0',
    s59_etpfus character varying(3)  DEFAULT '-',
    s59_clefus character varying(100)  DEFAULT NULL,
    n59_idtfus numeric(10,0)  DEFAULT '0',
    CONSTRAINT genetp_pkey PRIMARY KEY (c59_idetap)
);

CREATE TABLE IF NOT EXISTS tmpmas
(
    c75_codenv char        NOT NULL DEFAULT '',
    c75_codorg varchar(3) NOT NULL DEFAULT '',
    c75_codapp varchar(4) NOT NULL DEFAULT '',
    c75_percod varchar(9) NOT NULL DEFAULT '',
    c75_codcom varchar(4) NOT NULL DEFAULT '',
    c75_numcom varchar(2) NOT NULL DEFAULT '',
    c75_codfic varchar(5) NOT NULL DEFAULT '',
    s75_mascom varchar(4) NOT NULL DEFAULT '',
    s75_masfic varchar(5) NOT NULL DEFAULT '',
    s75_codsit varchar(6) NOT NULL DEFAULT '',
    s75_libfic varchar(80) NOT NULL DEFAULT '',
    s75_typsup char        NOT NULL DEFAULT '',
    primary key (c75_codenv, c75_codorg, c75_codapp, c75_percod, c75_codcom, c75_numcom, c75_codfic)
    );

CREATE TABLE IF NOT EXISTS premas
(
    c84_codenv char        NOT NULL DEFAULT '',
    c84_codorg varchar(3) NOT NULL DEFAULT '',
    c84_codapp varchar(4) NOT NULL DEFAULT '',
    c84_percod varchar(9) NOT NULL DEFAULT '',
    c84_codcom varchar(4) NOT NULL DEFAULT '',
    c84_numcom varchar(2) NOT NULL DEFAULT '',
    c84_codfic varchar(5) NOT NULL DEFAULT '',
    s84_mascom varchar(4) NOT NULL DEFAULT '',
    s84_masfic varchar(5) NOT NULL DEFAULT '',
    s84_codsit varchar(6) NOT NULL DEFAULT '',
    s84_presta varchar(50) NOT NULL DEFAULT '',
    d84_dprevc TIMESTAMP        DEFAULT NULL,
    d84_dprevt TIMESTAMP        DEFAULT NULL,
    d84_dprevi TIMESTAMP        DEFAULT NULL,
    primary key (c84_codenv, c84_codorg, c84_codapp, c84_percod, c84_codcom, c84_numcom, c84_codfic)
    );

CREATE TYPE IF NOT EXISTS Genapp_Typref AS enum('I','A');
CREATE TABLE IF NOT EXISTS genapp (
    c14_codenv CHAR(1) NOT NULL DEFAULT '',
    c14_codorg VARCHAR(3) NOT NULL DEFAULT '',
    c14_codapp VARCHAR(4) NOT NULL DEFAULT '',
    c14_percod VARCHAR(9) NOT NULL DEFAULT '',
    s14_appsta VARCHAR(50) NOT NULL DEFAULT '',
    s14_appinf VARCHAR(50),
    b14_arefec BOOLEAN NOT NULL,
    d14_dapplc TIMESTAMP,
    d14_dappld TIMESTAMP,
    d14_dapplt TIMESTAMP,
    d14_dappls TIMESTAMP,
    d14_dapplh TIMESTAMP,
    s14_typref Genapp_Typref NOT NULL DEFAULT 'I',
    b14_manuel BOOLEAN NOT NULL DEFAULT FALSE,
    s14_sitori VARCHAR(50),
    PRIMARY KEY (c14_codenv, c14_codorg, c14_codapp, c14_percod)
    );

CREATE TABLE IF NOT EXISTS public.genscr
(
    c41_codenv CHAR(1) NOT NULL DEFAULT '',
    c41_codorg VARCHAR(3) NOT NULL DEFAULT '',
    c41_codapp VARCHAR(4) NOT NULL DEFAULT '',
    c41_percod VARCHAR(9) NOT NULL DEFAULT '',
    c41_numscr VARCHAR(3) NOT NULL DEFAULT '',
    s41_signal VARCHAR(3) NOT NULL DEFAULT '',
    s41_script VARCHAR(128) NOT NULL DEFAULT '',
    s41_mesano text,
    s41_ficinf VARCHAR(128) DEFAULT NULL,
    d41_dcreat TIMESTAMP,
    n41_idetap numeric(10,0) NOT NULL DEFAULT '0',
    PRIMARY KEY (c41_codenv, c41_codorg, c41_codapp, c41_percod, c41_numscr)
);

CREATE TABLE IF NOT EXISTS public.region_mapping(
  codreg char(3) NOT NULL DEFAULT '',
  codana char(6) NOT NULL DEFAULT '',
  PRIMARY KEY (codana)
);

CREATE TABLE IF NOT EXISTS stadoc
(
    c72_docinf character varying(2) NOT NULL DEFAULT ''::character varying,
    s72_libinf character varying(80) DEFAULT NULL::character varying,
    CONSTRAINT stadoc_pkey PRIMARY KEY (c72_docinf)
);

CREATE TABLE IF NOT EXISTS gennot
(
    c28_codenv character(1) NOT NULL DEFAULT '',
    c28_codorg character varying(3) NOT NULL DEFAULT '',
    c28_codapp character varying(4) NOT NULL DEFAULT '',
    c28_percod character varying(9) NOT NULL DEFAULT '',
    c28_codcom character varying(4) NOT NULL DEFAULT '',
    c28_numcom character varying(2) NOT NULL DEFAULT '',
    c28_codfic character varying(5) NOT NULL DEFAULT '',
    c28_codnot character varying(12) NOT NULL DEFAULT '',
    n28_poinot numeric(6,0) NOT NULL DEFAULT '0',
    CONSTRAINT gennot_pkey PRIMARY KEY (c28_codenv, c28_codorg, c28_codapp, c28_percod, c28_codcom, c28_numcom, c28_codfic, c28_codnot)
);

CREATE TABLE IF NOT EXISTS notice
(
    c26_codnot character varying(12) NOT NULL DEFAULT '',
    s26_libnot character varying(50) NOT NULL DEFAULT '',
    s26_fornot character varying(10) NOT NULL DEFAULT '',
    n26_poinot numeric(6,0) NOT NULL DEFAULT '0'::numeric,
    s26_pornot character varying(1) NOT NULL DEFAULT 'L',
    d26_dnotir date,
    b26_perime smallint NOT NULL DEFAULT '0',
    s26_codsit character varying(6) DEFAULT NULL,
    CONSTRAINT notice_pkey PRIMARY KEY (c26_codnot)
);

CREATE TYPE IF NOT EXISTS notice_pornot AS enum('L','R', 'N');

CREATE TABLE IF NOT EXISTS tarpos
(
    c43_typtar character varying(3) NOT NULL DEFAULT '',
    s43_libtar character varying(50) NOT NULL DEFAULT '',
    n43_ordtar numeric(2,0) NOT NULL DEFAULT '0'::numeric,
    b43_tlibre smallint NOT NULL DEFAULT '0'::smallint,
    b43_compta smallint NOT NULL,
    b43_perime smallint NOT NULL DEFAULT '0'::smallint,
    CONSTRAINT tarpos_pkey PRIMARY KEY (c43_typtar)
);

CREATE TABLE IF NOT EXISTS genlie
(
    c60_idpere numeric(10,0) NOT NULL DEFAULT '0'::numeric,
    c60_idfils numeric(10,0) NOT NULL DEFAULT '0'::numeric,
    CONSTRAINT genlie_pkey PRIMARY KEY (c60_idpere, c60_idfils)
);

CREATE DOMAIN IF NOT EXISTS GENFIC_TYPSIG AS VARCHAR;

CREATE TABLE IF NOT EXISTS genbon
(
    c80_clebon character varying(3) NOT NULL DEFAULT ''::character varying,
    s80_codbon character varying(9) DEFAULT NULL::character varying,
    CONSTRAINT genbon_pkey PRIMARY KEY (c80_clebon)
);

CREATE TYPE IF NOT EXISTS hisfic_typsig AS ENUM('R', 'V');

CREATE TABLE IF NOT EXISTS hisfic
(
    c22_codenv character(1) NOT NULL DEFAULT '',
    c22_codorg character varying(3) NOT NULL DEFAULT '',
    c22_codapp character varying(4) NOT NULL DEFAULT '',
    c22_percod character varying(9) NOT NULL DEFAULT '',
    c22_codcom character varying(4) NOT NULL DEFAULT '',
    c22_numcom character varying(2) NOT NULL DEFAULT '',
    c22_codfic character varying(5) NOT NULL DEFAULT '',
    s22_ficsta character(1) NOT NULL DEFAULT '',
    s22_ficinf character varying(3) DEFAULT NULL,
    b22_frefec smallint NOT NULL DEFAULT '0',
    d22_dfichc timestamp without time zone,
    d22_dfichd timestamp without time zone,
    d22_dficht timestamp without time zone,
    d22_dfichs timestamp without time zone,
    d22_dfichh timestamp without time zone,
    b22_ficvid smallint NOT NULL DEFAULT '0',
    s22_libfic character varying(80) NOT NULL DEFAULT '',
    s22_typfor character(1) NOT NULL DEFAULT '',
    s22_typsup character(1) NOT NULL DEFAULT '',
    s22_typmul character(1) NOT NULL DEFAULT '',
    s22_reffor character varying(8)  DEFAULT NULL,
    s22_refimp character varying(8)  DEFAULT NULL,
    s22_refsup character varying(8)  DEFAULT NULL,
    s22_reftri character varying(8)  DEFAULT NULL,
    s22_refech character varying(8)  DEFAULT NULL,
    s22_refecl character varying(8)  DEFAULT NULL,
    n22_nbrrep numeric(2,0) NOT NULL DEFAULT '1',
    s22_ficatt character varying(50)  DEFAULT NULL,
    s22_verimp character varying(2)  DEFAULT NULL,
    n22_maxpag numeric(2,0) NOT NULL DEFAULT '5',
    b22_specim smallint NOT NULL DEFAULT '0',
    b22_cbadre smallint NOT NULL DEFAULT '0',
    b22_ediver smallint NOT NULL DEFAULT '0',
    b22_banimp smallint NOT NULL DEFAULT '1',
    b22_appbac smallint NOT NULL DEFAULT '0',
    d22_dfiexp date,
    s22_codprd character varying(5)  DEFAULT NULL,
    d22_dappcr timestamp without time zone,
    n22_repexp numeric(2,0) NOT NULL DEFAULT '1',
    s22_masuti character varying(50)  DEFAULT NULL,
    s22_codrnd character varying(14)  DEFAULT '',
    s22_typsig hisfic_typsig NOT NULL DEFAULT 'R',
    n22_pagfic numeric(8,0) NOT NULL DEFAULT '0',
    n22_plific numeric(6,0) NOT NULL DEFAULT '0',
    n22_rejfic numeric(6,0) NOT NULL DEFAULT '0',
    s22_codcli character varying(8)  DEFAULT NULL,
    s22_typtar character varying(3)  DEFAULT NULL,
    n22_codpal numeric(3,0) DEFAULT NULL,
    s22_codbon character varying(9)  DEFAULT NULL,
    d22_drecep timestamp without time zone,
    s22_inform character varying(80)  DEFAULT NULL,
    n22_delmsp numeric(2,0) DEFAULT NULL,
    s22_codsit character varying(6)  DEFAULT NULL,
    b22_eclate smallint NOT NULL DEFAULT '0',
    CONSTRAINT hisfic_pkey PRIMARY KEY (c22_codenv, c22_codorg, c22_codapp, c22_percod, c22_codcom, c22_numcom, c22_codfic)
);

CREATE TABLE IF NOT EXISTS histar
(
    c46_codenv character(1) NOT NULL DEFAULT '',
    c46_codorg character varying(3) NOT NULL DEFAULT '',
    c46_codapp character varying(4) NOT NULL DEFAULT '',
    c46_percod character varying(9) NOT NULL DEFAULT '',
    c46_codcom character varying(4) NOT NULL DEFAULT '',
    c46_numcom character varying(2) NOT NULL DEFAULT '',
    c46_codfic character varying(5) NOT NULL DEFAULT '',
    c46_typtar character varying(3) NOT NULL DEFAULT '',
    n46_nbplis numeric(6,0) NOT NULL DEFAULT '0',
    n46_coutot numeric(10,0) NOT NULL DEFAULT '0',
    CONSTRAINT histar_pkey PRIMARY KEY (c46_codenv, c46_codorg, c46_codapp, c46_percod, c46_codcom, c46_numcom, c46_codfic, c46_typtar)
);

CREATE TABLE IF NOT EXISTS public.notfic
(
    c27_codenv character(1) NOT NULL DEFAULT '',
    c27_codorg character varying(3) NOT NULL DEFAULT '',
    c27_codapp character varying(4) NOT NULL DEFAULT '',
    c27_codcom character varying(4) NOT NULL DEFAULT '',
    c27_codfic character varying(5) NOT NULL DEFAULT '',
    c27_codnot character varying(12) NOT NULL DEFAULT '',
    d27_dnotid date,
    d27_dnotit date,
    n27_maxnot numeric(4,0) NOT NULL DEFAULT '0',
    n27_curnot numeric(4,0) NOT NULL DEFAULT '0',
    CONSTRAINT notfic_pkey PRIMARY KEY (c27_codenv, c27_codorg, c27_codapp, c27_codcom, c27_codfic, c27_codnot)
);

CREATE TABLE IF NOT EXISTS public.notice_pdf (
    codnot VARCHAR(12) NOT NULL UNIQUE,
    pdf_file_path VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notice_pdf_pkey PRIMARY KEY (codnot)
);

CREATE TABLE IF NOT EXISTS hispro
(
    c23_codenv char       NOT NULL DEFAULT '',
    c23_codorg varchar(3) NOT NULL DEFAULT '',
    c23_codapp varchar(4) NOT NULL DEFAULT '',
    c23_percod varchar(9) NOT NULL DEFAULT '',
    c23_codcom varchar(4) NOT NULL DEFAULT '',
    c23_numcom varchar(2) NOT NULL DEFAULT '',
    c23_codfic varchar(5) NOT NULL DEFAULT '',
    c23_codgam varchar(2) NOT NULL DEFAULT '',
    s23_prosta char       NOT NULL DEFAULT '',
    s23_proinf varchar(3) DEFAULT NULL,
    b23_prefec smallint   NOT NULL DEFAULT '1',
    d23_dprodc timestamp,
    d23_dprodd timestamp,
    d23_dprodt timestamp,
    d23_dprods timestamp,
    d23_dprodh timestamp,
    n23_pagfic numeric(8) NOT NULL DEFAULT '0',
    n23_plific numeric(6) NOT NULL DEFAULT '0',
    n23_rejfic numeric(6) NOT NULL DEFAULT '0',
    primary key (c23_codenv, c23_codorg, c23_codapp, c23_percod, c23_codcom, c23_numcom, c23_codfic, c23_codgam)
);

CREATE TABLE IF NOT EXISTS hisnot
(
    c29_codenv character(1) NOT NULL DEFAULT '',
    c29_codorg character varying(3) NOT NULL DEFAULT '',
    c29_codapp character varying(4) NOT NULL DEFAULT '',
    c29_percod character varying(9) NOT NULL DEFAULT '',
    c29_codcom character varying(4) NOT NULL DEFAULT '',
    c29_numcom character varying(2) NOT NULL DEFAULT '',
    c29_codfic character varying(5) NOT NULL DEFAULT '',
    c29_codnot character varying(12) NOT NULL DEFAULT '',
    n29_poinot numeric(6,0) NOT NULL DEFAULT '0',
    CONSTRAINT hisnot_pkey PRIMARY KEY (c29_codenv, c29_codorg, c29_codapp, c29_percod, c29_codcom, c29_numcom, c29_codfic, c29_codnot)
);

CREATE TABLE IF NOT EXISTS hismas
(
    c33_masenv character(1) NOT NULL DEFAULT '',
    c33_masorg character varying(3) NOT NULL DEFAULT '',
    c33_masapp character varying(4) NOT NULL DEFAULT '',
    c33_masper character varying(9) NOT NULL DEFAULT '',
    c33_mascom character varying(4) NOT NULL DEFAULT '',
    c33_masnum character varying(2) NOT NULL DEFAULT '',
    c33_masfic character varying(5) NOT NULL DEFAULT '',
    c33_codenv character(1) NOT NULL DEFAULT '',
    c33_codorg character varying(3) NOT NULL DEFAULT '',
    c33_codapp character varying(4) NOT NULL DEFAULT '',
    c33_percod character varying(9) NOT NULL DEFAULT '',
    c33_codcom character varying(4) NOT NULL DEFAULT '',
    c33_numcom character varying(2) NOT NULL DEFAULT '',
    c33_codfic character varying(5) NOT NULL DEFAULT '',
    CONSTRAINT hismas_pkey PRIMARY KEY (c33_masenv, c33_masorg, c33_masapp, c33_masper, c33_mascom, c33_masnum, c33_masfic, c33_codenv, c33_codorg, c33_codapp, c33_percod, c33_codcom, c33_numcom, c33_codfic)
);

CREATE TYPE IF NOT EXISTS hisapp_typref AS ENUM ('I', 'A');

CREATE TABLE IF NOT EXISTS hisapp
(
    c21_codenv character(1) NOT NULL DEFAULT '',
    c21_codorg character varying(3) NOT NULL DEFAULT '',
    c21_codapp character varying(4) NOT NULL DEFAULT '',
    c21_percod character varying(9) NOT NULL DEFAULT '',
    s21_appsta character(1) NOT NULL DEFAULT '',
    s21_appinf character varying(3) DEFAULT NULL,
    b21_arefec smallint NOT NULL DEFAULT '0',
    d21_dapplc timestamp,
    d21_dappld timestamp,
    d21_dapplt timestamp,
    d21_dappls timestamp,
    d21_dapplh timestamp,
    s21_typref hisapp_typref NOT NULL DEFAULT 'I',
    b21_manuel smallint NOT NULL DEFAULT '0',
    s21_sitori character varying(6) DEFAULT NULL,
    CONSTRAINT hisapp_pkey PRIMARY KEY (c21_codenv, c21_codorg, c21_codapp, c21_percod)
);

CREATE TABLE IF NOT EXISTS organi_client_snv2
(
    c110_codorg character varying(3) NOT NULL,
    c110_codcli character varying(8) NOT NULL,
    CONSTRAINT organi_client_snv2_pkey PRIMARY KEY (c110_codorg, c110_codcli)
);

CREATE TABLE IF NOT EXISTS genpli
(
    c101_numpli character varying(15) NOT NULL,
    s101_codenv character(1) NOT NULL,
    s101_codorg character varying(3) NOT NULL,
    s101_codapp character varying(4) NOT NULL,
    s101_percod character varying(9) NOT NULL,
    n101_numcom character varying(2) NOT NULL,
    s101_codcom character varying(4) NOT NULL,
    s101_codfic character varying(5) NOT NULL,
    s101_plista character(1) NOT NULL,
    s101_pliinf character varying(3)  DEFAULT NULL,
    s101_zoncli character varying(40) NOT NULL,
    d101_dplidc timestamp without time zone,
    d101_dplidd timestamp without time zone,
    d101_dplidt timestamp without time zone,
    d101_dplide timestamp without time zone,
    d101_dplidh timestamp without time zone,
    n101_nbpage character varying(5) NOT NULL DEFAULT '0',
    n101_nbfeui character varying(5) NOT NULL DEFAULT '0',
    s101_edtype character varying(3) NOT NULL,
    n101_poipli character varying(5) NOT NULL DEFAULT '0',
    n101_coupli character varying(5) NOT NULL DEFAULT '0',
    n101_idtpli character varying(40) NOT NULL,
    s101_codpos character varying(5) NOT NULL,
    s101_codpay character varying(3) NOT NULL,
    s101_adres1 character varying(40),
    s101_adres2 character varying(40),
    s101_adres3 character varying(40),
    s101_adres4 character varying(40),
    s101_adres5 character varying(40),
    s101_adres6 character varying(40),
    s101_adres7 character varying(40),
    s101_expad1 character varying(40),
    s101_expad2 character varying(40),
    s101_expad3 character varying(40),
    s101_expad4 character varying(40),
    s101_genpro character varying(40),
    s101_infcl1 character varying(20),
    s101_infcl2 character varying(20),
    d101_datdep date,
    n101_mspidd character varying(10),
    n101_status character(1),
    n101_cominf character varying(255),
    s101_codgam character varying(3),
    CONSTRAINT genpli_pkey PRIMARY KEY (c101_numpli)
);

CREATE TABLE IF NOT EXISTS utilog
(
    c69_codulo INTEGER NOT NULL,
    s69_codsta VARCHAR(32) NOT NULL DEFAULT '',
    s69_codusr VARCHAR(12) NOT NULL DEFAULT '',
    s69_formid VARCHAR(100) NOT NULL DEFAULT '',
    d69_datulo TIMESTAMP,
    s69_action VARCHAR(32) NOT NULL DEFAULT '',
    s69_params text,
    b69_result smallint NOT NULL DEFAULT '1',
    s69_erreur text,
    s69_versio VARCHAR(6) DEFAULT NULL,
    PRIMARY KEY (c69_codulo)
);

CREATE TABLE IF NOT EXISTS format
(
    c17_typfor CHAR(1) NOT NULL DEFAULT '',
    s17_libfor VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (c17_typfor)
);

CREATE TABLE IF NOT EXISTS multif
(
    c19_typmul CHAR(1) NOT NULL DEFAULT '',
    s19_libmul VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (c19_typmul)
);

CREATE TYPE IF NOT EXISTS Help_TypeState AS enum('DRAFT','DISABLED', 'ENABLED');
CREATE TABLE IF NOT EXISTS help
(
    id integer NOT NULL,
    path character varying(250) NOT NULL DEFAULT '',
    message text,
    state Help_TypeState NOT NULL DEFAULT 'DRAFT',
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying(50) NOT NULL DEFAULT '',
    updated_by character varying(50) NOT NULL DEFAULT '',
    CONSTRAINT help_pkey PRIMARY KEY (id)
);

CREATE SEQUENCE IF NOT EXISTS HELP_ID_SEQ
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TYPE IF NOT EXISTS public.coitem_typeit AS ENUM('M', 'F', 'C', 'S');
CREATE TABLE IF NOT EXISTS habili
(
    id integer NOT NULL,
    parent_id integer,
    s97_typeit coitem_typeit,
    text character varying,
    ordre integer,
    CONSTRAINT habili_pk PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS path_habili
(
    path character varying(250) NOT NULL,
    habili_id integer NOT NULL,
    CONSTRAINT path_habili_pkey PRIMARY KEY (path)
);

CREATE ALIAS IF NOT EXISTS to_date FOR "fr.acoss.posdoc.database.util.H2Functions.toDate";
CREATE ALIAS IF NOT EXISTS to_timestamp FOR "fr.acoss.posdoc.database.util.H2Functions.toTimestamp";

CREATE TYPE IF NOT EXISTS faq_status AS ENUM
    ('DRAFT', 'ENABLED', 'DISABLED');

CREATE TABLE IF NOT EXISTS faq
(
    id integer NOT NULL,
    path character varying(255) NOT NULL,
    question text NOT NULL,
    answer text,
    status faq_status NOT NULL DEFAULT 'DRAFT'::faq_status,
    view_count integer NOT NULL DEFAULT 0,
    created_by character varying(50) NOT NULL,
    updated_by character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone,
    CONSTRAINT faq_pkey PRIMARY KEY (id)
);

CREATE SEQUENCE IF NOT EXISTS FAQ_ID_SEQ
    START WITH 3
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TABLE IF NOT EXISTS faq_exchange
(
    id integer NOT NULL,
    faq_id integer NOT NULL,
    author character varying(50) NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT faq_exchange_pk PRIMARY KEY (id),
    CONSTRAINT faq_exchange_fk FOREIGN KEY (faq_id)
        REFERENCES public.faq (id)
);

CREATE SEQUENCE IF NOT EXISTS FAQ_EXCHANGE_ID_SEQ
    START WITH 4
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TABLE IF NOT EXISTS faq_notification
(
    id integer NOT NULL,
    recipient_id character varying(15),
    faq_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT faq_notif_pk PRIMARY KEY (id),
    CONSTRAINT faq_notif_fk FOREIGN KEY (faq_id)
        REFERENCES public.faq (id)
);

CREATE SEQUENCE IF NOT EXISTS FAQ_NOTIFICATION_ID_SEQ
    START WITH 3
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TABLE IF NOT EXISTS profile
(
    code character varying(20) NOT NULL,
    libelle character varying(50),
    CONSTRAINT profile_pkey PRIMARY KEY (code)
);

CREATE TABLE IF NOT EXISTS profile_habili
(
    profile_code character varying(20) NOT NULL,
    habili_id integer NOT NULL,
    CONSTRAINT profil_habili_pkey PRIMARY KEY (profile_code, habili_id),
    CONSTRAINT habili_fk FOREIGN KEY (habili_id)
        REFERENCES public.habili (id),
    CONSTRAINT profile_fk FOREIGN KEY (profile_code)
        REFERENCES public.profile (code)
);

CREATE TABLE IF NOT EXISTS job_lock
(
    name character varying(50) NOT NULL,
    server character varying(250) NOT NULL,
    date timestamp without time zone NOT NULL,
    CONSTRAINT job_lock_pkey PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS papaad
(
    c79_codcom varchar(4)  NOT NULL DEFAULT '',
    c79_codfic varchar(5)  NOT NULL DEFAULT '',
    c79_cnotif varchar(4)  NOT NULL DEFAULT '',
    s79_libpaa varchar(50),
    b79_period smallint,
    s79_codrnd varchar(8),
    s79_apppro varchar(8),
    s79_typhas varchar(8),
    s79_format varchar(8),
    s79_isurib varchar(8),
    b79_nstruc smallint,
    b79_imprim smallint,
    b79_huissi smallint,
    b79_numnot smallint,
    b79_strraf smallint,
    b79_contra smallint,
    b79_medele smallint,
    b79_idtbcc smallint,
    PRIMARY KEY (c79_codcom, c79_codfic, c79_cnotif)
);

-- Schéma cereus pour ProductionFlux
CREATE SCHEMA IF NOT EXISTS cereus;

CREATE TABLE IF NOT EXISTS cereus.dca_production_flux
(
    id INTEGER NOT NULL,
    nom_archive_retour varchar(255),
    date_production timestamp without time zone,
    date_poste timestamp without time zone,
    nom_fichier_retour varchar(255),
    nombre_plis_fabriques INTEGER,
    details INTEGER,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS cereus.dca_pli_detail_production
(
    id INTEGER NOT NULL,
    id_production_flux INTEGER,
    PRIMARY KEY (id)
);
