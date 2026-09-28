INSERT INTO public.notice (c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit)
VALUES ('CESU', 'libelle1', 'ED1', 1, 'L', '2024-05-23', 0, 'CIRTIL'),
       ('CESU2', 'libelle2', 'ED2', 2, 'L', '2024-05-23', 0, 'CIRTIL'),
       ('CES ENVALLIA', 'ENVELOPPE DEPART', 'ED', 50, 'L', null, 0, 'INTEGR'),
       ('CNAV', ' CNAV', 'ED', 0, 'L', null, 0, 'INTEGR');

INSERT INTO public.notfic (c27_codenv, c27_codorg, c27_codapp, c27_codcom, c27_codfic, c27_codnot, d27_dnotid, d27_dnotit, n27_maxnot, n27_curnot)
VALUES ('T', 'CIR', 'TIL', 'CIR', 'TIL', 'CESU1', '2024-05-23', '2024-05-23', 1, 0),
       ('P', 'CIR', 'TIL', 'CIR', 'TIL', 'CESU2', '2024-05-23', '2024-05-23', 2, 0),
       ('T', 'CIR', 'TIL', 'CIR', 'TIL', 'CES ENVALLIA', null, null, 50, 0),
       ('P', 'CIR', 'TIL', 'CIR', 'TIL', 'TEST', null, null, 0, 0);

INSERT INTO public.notice_pdf (codnot, pdf_file_path, upload_date)
VALUES ('CESU', 'path1', '2024-05-23'),
       ('CESU2', 'path2', '2024-05-23'),
       ('CES ENVALLIA', 'path3', '2024-05-23');