INSERT INTO public.genmas(c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic,
                   c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES ('T', '00L', 'MAS', '230331-00', 'MAS4', '00', 'M4001',
        'T', '42C', 'CES', '230331-00', 'IPVT', '00', 'CV02A'),
       ('T', '00L', 'MAS', '230331-00', 'MAS4', '00', 'M4001',
        'T', '42C', 'CES', '230331-00', 'PP10', '00', 'CV02B');

INSERT INTO public.gentar(c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar, n45_nbplis, n45_coutot)
VALUES ('T', '42C', 'CES', '230331-00', 'IPVT', '00', 'CV02A', 'TF', 200, 1470),
       ('T', '42C', 'CES', '230331-00', 'IPVT', '00', 'CV02A', 'RG', 200, 1000),
       ('T', '42C', 'CES', '230331-00', 'PP10', '00', 'CV02B', 'RG', 300, 1110);

INSERT INTO public.tarpos(c43_typtar, s43_libtar, n43_ordtar, b43_tlibre, b43_compta, b43_perime)
VALUES ('TF', 'FRANCE ENTIERE  TEMPOST TARIF ECO ', 30, 0, 0, 0),
       ('RG', 'Regroupement massification ', 30, 0, 0, 0);

INSERT INTO params(c32_codpar, s32_valpar, s32_libpar)
VALUES ('MASAPP', 'MAS', null);