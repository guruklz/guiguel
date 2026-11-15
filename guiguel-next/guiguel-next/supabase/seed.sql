-- Dados de exemplo (opcional). Rode depois da migração.
insert into public.assets (code, name, short_label, type, sector, product, status, map_x, map_y, map_w, map_h) values
 ('A-01','Injetora INJ-01','INJ 01','Injetora','Injeção','Tampas Nutella','running',47,60,26,111),
 ('A-02','Injetora INJ-02','INJ 02','Injetora','Injeção','Tampas Nutella','running',82,63,30,103),
 ('A-03','Injetora INJ-03','INJ 03','Injetora','Injeção','Tampas Marinex','stopped',130,67,29,92),
 ('A-04','Injetora INJ-04','INJ 04','Injetora','Injeção','Tampas Marinex','running',193,74,34,110),
 ('A-05','Injetora INJ-05','INJ 05','Injetora','Injeção','Tampas Starbucks','running',248,75,40,117),
 ('A-12','Seladora SEL-01','SEL 01','Seladora','Acabamento','Tampas de creme','running',667,42,31,59),
 ('A-13','Seladora SEL-02','SEL 02','Seladora','Acabamento','Tampas Marinex','running',717,45,30,54),
 ('A-14','Tampografia TAM-01','TAM 01','Tampografia','Acabamento','Tampas Starbucks','running',761,44,31,59),
 ('A-18','Embaladora EMB-01','EMB 01','Embaladora','Embalagem','Caixas de tampas','running',761,208,37,82);
insert into public.stock_items (code, name, qty, min_qty) values
 ('P-100','Resistência de aquecimento',2,6), ('P-101','Filtro de óleo hidráulico',6,4), ('P-102','Cliché de tampografia',3,2);
-- Depois de criar o primeiro usuário no painel do Supabase, promova-o a administrador:
-- update public.profiles set role = 'admin' where id = '<UUID-do-usuario>';
