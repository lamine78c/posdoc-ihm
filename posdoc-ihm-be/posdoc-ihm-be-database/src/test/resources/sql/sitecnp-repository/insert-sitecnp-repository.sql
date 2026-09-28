INSERT INTO sitcnp (C73_Codsit, S73_Hostad, S73_Userid, S73_Passwd, S73_Resdel, S73_Masorg) VALUES
    ('S01', 'host01', 'user01', 'pwd01', 'RES00001', '001'),
    ('S02', 'host02', 'user02', 'pwd02', 'RES00002', '002'),
    ('S03', 'host03', 'user03', 'pwd03', 'RES00003', '003'),
    ('S04', 'host04', 'user04', 'pwd04', 'RES00004', '004');

INSERT INTO ORGANI (C00_Codorg, S00_Liborg, S00_Adres1, S00_Adres2, S00_Adres3, S00_Adres4, S00_Typorg, S00_Codreg, S00_Codsit) VALUES
    ('100', 'ORGANISME LIE S02',    NULL, NULL, NULL, NULL, 'R', '117', 'S02'),
    ('210', 'ORGANISME LIE S03 #1', NULL, NULL, NULL, NULL, 'R', '117', 'S03'),
    ('220', 'ORGANISME LIE S03 #2', NULL, NULL, NULL, NULL, 'R', '117', 'S03'),
    ('230', 'ORGANISME LIE S03 #3', NULL, NULL, NULL, NULL, 'R', '117', 'S03'),
    ('999', 'ORGANISME ORPHELIN',   NULL, NULL, NULL, NULL, 'R', '117', 'S99');
