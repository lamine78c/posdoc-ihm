INSERT INTO gentar(c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar, n45_nbplis, n45_coutot)
VALUES ('P', '117', 'SNV2', '250321-00', 'RDEH', '00', 'L00', 'TF', 200, 1470);

INSERT INTO params(c32_codpar, s32_valpar, s32_libpar)
VALUES ('MASAPP', 'MAS', null);

INSERT INTO tarpos(c43_typtar, s43_libtar, n43_ordtar, b43_tlibre, b43_compta, b43_perime)
VALUES ('TF', 'FRANCE ENTIERE  TEMPOST TARIF ECO ', 30, 0, 0, 0);

INSERT INTO genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                   s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                   d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                   s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                   s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                   d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                   n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                   d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('P', '117', 'SNV2', '250321-00', 'RDEH', '00', 'L00',
    'T', '008', 1, '2024-07-23 14:52:15', '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43',
    null, 0, 'CES ENVALLIA -  CESU - NAT 6058 - NAT 6219', 'B', 'S', '-', null,
    null, null, null, null, null, 1, null,
    null, 8, 0, 0, 0, 0, 0,
    null, null, '2024-07-23 14:50:15', 1, null, null, 'R',
    20118, 18954, 4, 'UCN', 'TF', null, null,
    '2024-12-23 14:50:15', null, null, 'CIRTIL', 0);
    
    
INSERT INTO organi()
VALUES ()