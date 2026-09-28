INSERT INTO ORGANI (C00_Codorg, S00_Liborg, S00_Adres1, S00_Adres2, S00_Adres3, S00_Adres4, S00_Typorg, S00_Codreg, S00_Codsit) VALUES
   ('750', 'URSSAF ILE DE FRANCE', NULL, NULL, NULL, NULL, 'R', '117', ''),
   ('210', 'URSSAF DE LA COTE D OR (DIJON)', NULL, NULL, NULL, NULL, 'R', '267', ''),
   ('100', 'URSSAF DE L AUBE', NULL, NULL, NULL, NULL, 'R', '217', 'CIRTIL'),
   ('904', 'URSSAF 904', NULL, NULL, NULL, NULL, 'R', null, 'CIRTIL');

INSERT INTO ENVIRO(C01_Codenv, S01_Libenv) VALUES
    ('A', 'Un environnement');
INSERT INTO ENVIRO(C01_Codenv, S01_Libenv) VALUES
    ('B', 'Un autre environnement');

INSERT INTO GAMMES(C06_Codgam,S06_Libgam,S06_Codver) VALUES
    ('UP','Gamme de produits à mettre à jour','VERROU');
INSERT INTO GAMMES(C06_Codgam,S06_Libgam,S06_Codver) VALUES
    ('RT','Gamme de produits à supprimer','VERROU');
INSERT INTO GAMMES(C06_Codgam,S06_Libgam,S06_Codver) VALUES
    ('VG','Gamme de produits à supprimer','VERROU');

INSERT INTO Server (C03_Codser,S03_Codsys,S03_Libser,S03_Adreip,B03_Sertst,B03_Seract) values ('ADELAID2','L','Serveur Adelaide B2','ADELAIDEB2',0,1);
INSERT INTO Server (C03_Codser,S03_Codsys,S03_Libser,S03_Adreip,B03_Sertst,B03_Seract) values ('ADELAIDE','L','Serveur ADELAIDE de production','cnp75adelaide64p3.cnp75.recouv',0,1);
INSERT INTO Server (C03_Codser,S03_Codsys,S03_Libser,S03_Adreip,B03_Sertst,B03_Seract) values ('ADELCIRS','L','Serveur Adelaide Toulouse','cer31adelaide.cer31.recouv',0,1);
INSERT INTO Server (C03_Codser,S03_Codsys,S03_Libser,S03_Adreip,B03_Sertst,B03_Seract) values ('ADELLYON','L','Serveur Adelaide Lyon','cnp69adelaide.cer69.recouv',0,1);
INSERT INTO Server (C03_Codser,S03_Codsys,S03_Libser,S03_Adreip,B03_Sertst,B03_Seract) values ('ADLNANCY','L','Serveur CERTI de NANCY','10.5.199.83',0,1);
INSERT INTO Server (C03_Codser,S03_Codsys,S03_Libser,S03_Adreip,B03_Sertst,B03_Seract) values ('CNP75ADP','L','Serveur CNP75ADPV2 - PAPYRUS','cnp75adpv2.ur750.recouv',0,1);
INSERT INTO Server (C03_Codser,S03_Codsys,S03_Libser,S03_Adreip,B03_Sertst,B03_Seract) values ('CNP75AP1','L','Serveur CNP75ADPV1 PAPYRUS IDF','cnp75adpv1.ur750.recouv',0,1);

INSERT INTO Client (C47_Codcli,S47_Libcli,S47_Codalg) values ('ABCD', 'Client ABCD', 'EF');
INSERT INTO Client (C47_Codcli,S47_Libcli,S47_Codalg) values ('JKLM', 'Client à delete', 'EF');

INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CD','0001','2014-01-01',null,0,0,1,0,0);
INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CP','0000','2010-08-01','2011-06-30',395,0,1,0,0);
INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CP','0001','2011-07-01','2012-12-31',409,0,1,0,0);
INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CP','0002','2013-01-01','2013-12-31',417,0,1,0,0);
INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CP','0003','2014-01-01',null,426,0,1,0,0);

INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CP2','0001','2011-07-01','2012-12-31',461,0,1,0,1);
INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CP2','0002','2013-01-01','2013-12-31',470,0,1,0,0);
INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CP2','0003','2014-01-01',null,481,0,1,0,0);
INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CP2','0004','2015-02-12',null,5,0,0,0,1);

INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CPD','0001','2014-01-01',null,481,0,1,0,0);
INSERT INTO Tarifs(C44_Typtar,C44_Numtar,D44_Dtarid,D44_Dtarif,N44_Coupli,B44_Optar1,B44_Optar2,B44_Optar3,B44_Urgent) values ('CPD','0002','2015-02-12',null,5,0,0,0,1);

INSERT INTO Tarpos(C43_Typtar,S43_Libtar,N43_Ordtar,B43_Tlibre,B43_Compta,B43_Perime) values ('CPD','lib1',1,0,1,0);
INSERT INTO Tarpos(C43_Typtar,S43_Libtar,N43_Ordtar,B43_Tlibre,B43_Compta,B43_Perime) values ('CPA','lib2',2,0,0,0);

INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('ACEMED','1','Booleen Gestion des MED en mode ACE');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('ADLDAT','/adldatas','');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('ADLRUN','/adlrun','');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('ADRMEL','mlv_dom_thom','Groupe mail de validation pour masse');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('CBA','A mettre à jour','Libelle');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('DEL1','A supprimer','Libelle');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('DEL2','A supprimer','Libelle');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('MASGAM','FT',null);
MERGE INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) KEY (C32_Codpar) VALUES ('MASAPP','MAS',null);
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('OGUORG','999','Organisme de référence OGUR');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('MASIND','00','INDICE DE DÉPART POUR LES PÉRIODES MASSIFIÉES');
INSERT INTO Params (C32_Codpar,S32_Valpar,S32_Libpar) VALUES ('VERSIO','Versio','Version pour le test');

INSERT INTO Parres (C36_Refdis,S36_Libdis,S36_Logtrf,S36_Comdis) VALUES ('ABORT','Commande ABORT','B','FIC("/adlrun/shref/s03_dis_exit.sh")');
INSERT INTO Parres (C36_Refdis,S36_Libdis,S36_Logtrf,S36_Comdis) VALUES ('ADL_PLATYPUS','Distribution des fichiers LST pour PLATYPUS','F','"binary;passive;mkdir /adldatas/platytest/";CODORG;"/";CODCOM;";cd /adldatas/platytest/";CODORG;"/";CODCOM;";put ";F_PRODUIT;" ";LCASE(CODENV);"_";CODORG;"_";LCASE(ESP(CODCOM));".";LCASE(ESP(CODFIC));".";DROITE(DATJOU,6);TIMJOU;".lst"');
INSERT INTO Parres (C36_Refdis,S36_Libdis,S36_Logtrf,S36_Comdis) VALUES ('BUROTIK_10','Transfert Bureautique','F','"binary;mkdir /bureautique/Fbureautique/";CODCOM;";put ";F_PRODUIT;" /bureautique/Fbureautique/";CODCOM;"/";LCASE(CODCOM);".";LCASE(ESP(CODFIC));".";DATJOU;TIMJOU;NUMCOM');

INSERT INTO Verrou (C75_Codver,S75_Libver,N75_Maxexe) VALUES ('BM','Verrou specifique à la gamme BM',50);
INSERT INTO Verrou (C75_Codver,S75_Libver,N75_Maxexe) VALUES ('DM','Verrou specifique à la gamme DM',12);
INSERT INTO Verrou (C75_Codver,S75_Libver,N75_Maxexe) VALUES ('DOC1','Verrou lie aux process DOC1',50);

INSERT INTO Region (C62_Codreg,S62_Libreg) VALUES ('116','REGION ILE DE FRANCE TGE');
INSERT INTO Region (C62_Codreg,S62_Libreg) VALUES ('117','REGION ILE DE FRANCE');
INSERT INTO Region (C62_Codreg,S62_Libreg) VALUES ('217','REGION CHAMPAGNE ARDENNE');

INSERT INTO public.sitcnp (c73_codsit, s73_hostad, s73_userid, s73_passwd, s73_resdel, s73_masorg)
VALUES ('CIR', 'cnp31adelaide1', 'user1', 'pwd1', 'CNP31', '750'),
       ('CIT', 'cnp31adelaide2', 'user2', 'pwd2', 'CNP31', '904'),
       ('DEV', 'cnp31adelaide3', 'user3', 'pwd3', 'CNP31', '42C'),
       ('INT', 'cnp31adelaide4', 'user4', 'pwd4', 'CNP31', '00L');

INSERT INTO ressou (c08_codenv, c08_codorg, c08_codapp, c08_codgam, c08_codsit, c08_codres, s08_codser,
                    s08_libres, s08_typres, s08_logtrf, s08_compro, s08_comlia, s08_userid, s08_passwd,
                    s08_typfus, b08_fusdes, s08_filimp, s08_infuti, b08_bloque, b08_resmsp, s08_profil)
VALUES ('T', '750', 'SNV2', 'MA', 'CIRTIL', 'MASSI', 'ADELAIDE', 'TEST - Mise Sous Pli - TEST', 'C', 'B', 'NODIST_BA',
       'NODIST_BA', '', '', '-', 0, '', '', 0, 1, null),
       ('D', '904', 'SNV2', 'FT', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
       'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
       ('P', '100', 'TEST', 'FT', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
       'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null);

INSERT INTO exempl (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe,
                           s11_codsit, s11_codres, s11_coddes, n11_nbrexe, b11_exeact)
VALUES ('I', '010', 'SNV2', 'EI02', 'L01', 'ST', '01', 'CIRTIL', 'MASSI', '', 1, 1);
INSERT INTO exempl (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe,
                           s11_codsit, s11_codres, s11_coddes, n11_nbrexe, b11_exeact)
VALUES ('P', '010', 'SNV2', 'EI02', 'L02', 'ST', '01', 'CIRTIL', 'MASSI', '', 1, 1);
INSERT INTO exempl (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe,
                           s11_codsit, s11_codres, s11_coddes, n11_nbrexe, b11_exeact)
VALUES ('I', '973', 'SNV2', 'AZ00', 'L00', 'PF', '1', 'CIRTIL', 'COALA', '', 1, 1);
INSERT INTO exempl (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe,
                           s11_codsit, s11_codres, s11_coddes, n11_nbrexe, b11_exeact)
VALUES ('P', '010', 'SNV2', 'AZ00', 'L00', 'PF', '1', 'CIRTIL', 'COALA', '', 1, 1);
INSERT INTO exempl (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe,
                           s11_codsit, s11_codres, s11_coddes, n11_nbrexe, b11_exeact)
VALUES ('T', '750', 'SNV2', 'RDEH', 'L02', 'MA', '1', 'CIRTIL', 'MASSI', 'DESTI', 1, 1);
INSERT INTO exempl (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe,
                           s11_codsit, s11_codres, s11_coddes, n11_nbrexe, b11_exeact)
VALUES ('T', '750', 'MAS', 'RDEH', 'L02', 'FT', '1', 'CIRTIL', 'MASSI', '', 1, 1),
       ('T', '750', 'SNV2', 'RDEH', 'L02', 'FT', '1', 'CIRTIL', 'MASSI', 'addre', 1, 1);

INSERT INTO fichie(
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim, b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES ('D', '904', 'SNV2', 'RDEH', 'L04', 'ECHEANCIER TRIMESTRIEL PRELEVE', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5,	1, 1, 0, 1,	0, null, 'QD14E', 1, 'V', '', '', 0);
INSERT INTO fichie(
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim, b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES ('T', '750', 'SNV2', 'RDEH', 'L02', 'LISTE SURVEILLANCE DES STRUCTU', 'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', '', '', 0);
INSERT INTO fichie(
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim, b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES ('T', '100', 'SNV2', 'TY25', 'M0001', 'LISTE TEST', 'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', '', '', 0);
INSERT INTO fichie(
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim, b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES ('T', '00L', 'MAS', 'MAS4', 'M4001', 'LISTE TEST', 'V', 'S', '-', '-', '-', '-', null, null, null, 1, 'RECTO-SIMPLE', null, 8, 0, 0, 0, 0, 0, null, 'PC52C', 1, 'V', 'UCN', '', 0);
INSERT INTO fichie(
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim, b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES ('I', '010', 'SNV2', 'EI02', 'L01', 'LIBELLE FICHIER 1', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'QD14E', 1, 'V', '', '', 0),
       ('P', '010', 'SNV2', 'EI02', 'L02', 'LIBELLE FICHIER 2', 'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', '', '', 0);

INSERT INTO comman (c05_codenv, c05_codorg, c05_codapp, c05_codcom, s05_libcom) values ('N','750','SNV2','ER04','ECLATEMENT FICHIER CRR DE LA CPAM POUR TU35');
INSERT INTO comman (c05_codenv, c05_codorg, c05_codapp, c05_codcom, s05_libcom) values ('T','100','SNV2','TY25','CORRECTION EFFECTIF PENALITE SUR PJ VLU');
INSERT INTO comman (c05_codenv, c05_codorg, c05_codapp, c05_codcom, s05_libcom) values ('N','750','TEST','TR23','ALIMENTATION COLLECTEUR TV80');
INSERT INTO comman (c05_codenv, c05_codorg, c05_codapp, c05_codcom, s05_libcom) values ('T','750','SNV2','RDEH','CORRECTION EFFECTIF PENALITE SUR PJ VLU');

INSERT INTO public.produi (c09_codenv, c09_codorg, c09_codapp, c09_codcom, c09_codfic, c09_codgam, b09_proact)
VALUES ('P', '010', 'SNV2', 'EI02', 'L02', 'ST', 1);
INSERT INTO public.produi (c09_codenv, c09_codorg, c09_codapp, c09_codcom, c09_codfic, c09_codgam, b09_proact)
VALUES ('T', '117', 'SNV2', 'RDEH', 'L00', 'UP', 1);

INSERT INTO public.applis(
    c04_codenv, c04_codorg, c04_codapp, s04_codsys, s04_libapp, s04_typref)
VALUES ('T', '910', 'SNV2', 'L', 'Application snv2', 'A');

INSERT INTO public.applis(
    c04_codenv, c04_codorg, c04_codapp, s04_codsys, s04_libapp, s04_typref)
VALUES ('T', '920', 'SNV2', 'L', 'Application snv2', 'A');

INSERT INTO public.applis(
    c04_codenv, c04_codorg, c04_codapp, s04_codsys, s04_libapp, s04_typref)
VALUES ('T', '930', 'SNV2', 'L', 'Application snv2', 'A');

INSERT INTO public.applis(
    c04_codenv, c04_codorg, c04_codapp, s04_codsys, s04_libapp, s04_typref)
VALUES ('T', '940', 'SNV2', 'L', 'Application snv2', 'A');

INSERT INTO public.destin(c10_codorg, c10_coddes, s10_libdes, s10_refpri) VALUES ('750', 'addre', 'adresse', 'ref adresse');
INSERT INTO public.destin(c10_codorg, c10_coddes, s10_libdes, s10_refpri) VALUES ('100', 'addre', 'adresse', 'ref adresse');

INSERT INTO public.genfic (c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                           s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                           d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                           s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                           s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                           d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                           n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                           d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', '', '', 0,
        null, null, null, null, null, 0, '', '', '', '',
        '', '', '', '', '', '', 1, '', '', 5,
        0, 0, 0, 1, 0, null, '', null, 1, null,
        '', 'R', 0, 0, 0, '', null, null, null, null,
        null, null, 'CIRTIL', 0),

       ('T', '904', 'SNV2', '240512-10', 'BORY', '01', 'L00', '', '', 0,
        null, null, null, null, null, 0, '', '', '', '',
        '', '', '', '', '', '', 1, '', '', 5,
        0, 0, 0, 1, 0, null, '', null, 1, null,
        '', 'R', 0, 0, 0, '', null, null, null, null,
        null, null, 'CIRTIL', 0),
       ('T', '750', 'MAS', '240523-00', 'RDEH', '00', 'L02', '', '', 0,
        null, null, null, null, null, 0, '', '', '', '',
        '', '', '', '', '', '', 1, '', '', 5,
        0, 0, 0, 1, 0, null, '', null, 1, null,
        '', 'R', 0, 0, 0, '', null, null, null, null,
        null, null, 'CIRTIL', 0),
       ('T', '00L', 'MAS', '230331-00', 'MAS4', '00', 'M4001', '', '', 0,
        null, null, null, null, null, 0, '', '', '', '',
        '', '', '', '', '', '', 1, '', '', 5,
        0, 0, 0, 1, 0, null, '', null, 1, null,
        '', 'R', 0, 0, 0, '', null, null, null, null,
        null, null, 'CIRTIL', 0),
       ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', '', '', 0,
        null, null, null, null, null, 0, '', '', '', '',
        '', '', '', '', '', '', 1, '', '', 5,
        0, 0, 0, 1, 0, null, '', null, 1, null,
        '', 'R', 0, 0, 0, '', null, null, null, null,
        null, null, 'CIRTIL', 0);

INSERT INTO public.genpro (c16_codenv, c16_codorg, c16_codapp, c16_percod, c16_codcom, c16_numcom, c16_codfic,
                           c16_codgam, s16_prosta, s16_proinf, b16_prefec, d16_dprodc, d16_dprodd, d16_dprodt,
                           d16_dprods, d16_dprodh, n16_pagfic, n16_plific, n16_rejfic)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'FT', 'H', '000', 0, '2024-05-23 20:34:36.000000',
        '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0),
       ('T', '750', 'MAS', '240523-00', 'RDEH', '00', 'L02', 'FT', 'H', '000', 0, '2024-05-23 20:34:36.000000',
        '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0),
       ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'MA', 'H', '000', 0, '2024-05-23 20:34:36.000000',
        '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0);

INSERT INTO public.genetp(	c59_idetap, s59_typetp, s59_codenv, s59_codorg, s59_codapp, s59_percod, s59_codcom,
                              s59_numcom, s59_codfic, s59_codgam, s59_numexe, s59_codres, s59_codsit, s59_coddes, n59_nbrexe, s59_codser,
                              s59_codsig, s59_signal, b59_reedit, b59_fabsim, s59_statut, n59_codinf, d59_create, d59_valide, d59_debute,
                              d59_termin, d59_invali, d59_suspen, d59_histor, s59_script, n59_stepno, n59_numpid, s59_etpfus, s59_clefus, n59_idtfus)
VALUES (1, 'DIS', 'T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'FT', null, 'codres', 'CIRSO', null, 1, null, null, null, 1, 1,
        null, 1, null, null, null, null, null, null, null, null, 1, 1, null, null, 1);

INSERT INTO tmpmas (c75_codenv, c75_codorg, c75_codapp, c75_percod, c75_codcom, c75_numcom, c75_codfic, s75_mascom, s75_masfic, s75_codsit, s75_libfic, s75_typsup)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'MAS4', 'M4569', 'CIRTIL','CES ENVALLIA - #CESU - #CIP - NAT/6077', 'S');

INSERT INTO premas (c84_codenv, c84_codorg, c84_codapp, c84_percod, c84_codcom, c84_numcom, c84_codfic, s84_mascom, s84_masfic, s84_codsit, s84_presta, d84_dprevc, d84_dprevt, d84_dprevi)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'MAS4', 'M4569', 'CIRTIL', 'SomePresta', '2023-05-24', '2023-05-25', '2023-05-26');

INSERT INTO genapp (c14_codenv, c14_codorg, c14_codapp, c14_percod, s14_appsta, s14_appinf, b14_arefec, d14_dapplc, d14_dappld, d14_dapplt, d14_dappls, d14_dapplh, s14_typref, b14_manuel, s14_sitori)
VALUES  ('T', '910', 'SNV2', '230816-0G', 'appsta_value', 'appinf_value', TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', 0, 'sitori_value');

INSERT INTO public.genscr(
    c41_codenv, c41_codorg, c41_codapp, c41_percod, c41_numscr, s41_signal, s41_script, s41_mesano, s41_ficinf, d41_dcreat, n41_idetap)
VALUES ('T', '00L', 'MAS', '230331-00', '007', 'S05', 's05mm_00_mas4_m4001.sh', 'Anomalie SWEAVER /adldatas/tmp/t_00l_mas_230331-00/divers/s05mm_00_mas4_m4001.sh.026 (8)', '/adldatas/tmp/t_00l_mas_230331-00/divers/s05mm_00_mas4_m4001.sh.02616212.LOG', '2024-07-23 14:52:43', 1739);

INSERT INTO public.gennot (c28_codenv, c28_codorg, c28_codapp, c28_percod, c28_codcom, c28_numcom, c28_codfic, c28_codnot, n28_poinot)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'CESU1', 1),
       ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'CESU2', 2);

INSERT INTO public.notice (c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit)
VALUES ('CESU1', 'libelle1', 'ED1', 1, 'L', '2024-05-23', 0, 'CIRTIL'),
       ('CESU2', 'libelle2', 'ED2', 2, 'L', '2024-05-23', 0, 'CIRTIL');

INSERT INTO public.gentar(c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar, n45_nbplis, n45_coutot)
VALUES ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'RG', '1160', '4719');

INSERT INTO public.sitcnp(c73_codsit, s73_hostad, s73_userid, s73_passwd, s73_resdel, s73_masorg)
VALUES ('CIRSO', 'cnp31adelaide3.cer31.recouv', 'xxxx', 'xxxx', 'CNP31', '00T'),
       ('CIRTIL', 'cnp69adelaide.cer69.recouv', 'xxxx', 'xxxx', 'CNP31', '00L');
INSERT INTO public.genmas (c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic,
                           c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES ('T','750','MAS','240523-00','RDEH','00','L02',
        'T','750','MAS','240523-00','RDEH','00','L02');
INSERT INTO public.genmas (c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic,
                           c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES ('T','00L','MAS','230331-00','MAS4','00','M4001',
        'T','42C','CES','230106-00','IPVT','00','CV02A');















