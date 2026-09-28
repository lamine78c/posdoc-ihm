-- Purge complete de la DB H2 avant chaque test (BEFORE_TEST_METHOD).
-- Branche depuis AbstractGraphqlTest via @SqlMergeMode(MERGE), donc s applique a tous les tests.
-- Sans cette purge, l ordre Surefire non-deterministe entre classes provoque des collisions de PK
-- (ex: schema-insert-data.sql et insert-occurrence-etape.sql insertent tous deux dans genetp avec PK=1).

SET REFERENTIAL_INTEGRITY FALSE;

DELETE FROM ficadr;
DELETE FROM faq_notification;
DELETE FROM faq_exchange;
DELETE FROM faq;
DELETE FROM profile_habili;
DELETE FROM profile;
DELETE FROM path_habili;
DELETE FROM habili;
DELETE FROM help;
DELETE FROM papaad;
DELETE FROM multif;
DELETE FROM format;
DELETE FROM gendoc;
DELETE FROM stadoc;
DELETE FROM genpli;
DELETE FROM organi_client_snv2;
DELETE FROM hisapp;
DELETE FROM histar;
DELETE FROM hisfic;
DELETE FROM hispro;
DELETE FROM notfic;
DELETE FROM tarpos;
DELETE FROM stainf;
DELETE FROM statut;
DELETE FROM utilog;
DELETE FROM gentar;
DELETE FROM notice;
DELETE FROM gennot;
DELETE FROM genscr;
DELETE FROM genbon;
DELETE FROM genapp;
DELETE FROM premas;
DELETE FROM tmpmas;
DELETE FROM genetp;
DELETE FROM genlie;
DELETE FROM genpro;
DELETE FROM genmas;
DELETE FROM genfic;
DELETE FROM destin;
DELETE FROM applis;
DELETE FROM contenus_regions;
DELETE FROM contenu;
DELETE FROM produi;
DELETE FROM comman;
DELETE FROM fichie;
DELETE FROM exempl;
DELETE FROM ressou;
DELETE FROM myslog;
DELETE FROM compos;
DELETE FROM suppor;
DELETE FROM sitcnp;
DELETE FROM sitorg;
DELETE FROM region_mapping;
DELETE FROM region;
DELETE FROM verrou;
DELETE FROM parres;
DELETE FROM parcle;
DELETE FROM params;
DELETE FROM tarifs;
DELETE FROM client;
DELETE FROM server;
DELETE FROM gammes;
DELETE FROM enviro;
DELETE FROM organi;
DELETE FROM service;
DELETE FROM utilis;

SET REFERENTIAL_INTEGRITY TRUE;
