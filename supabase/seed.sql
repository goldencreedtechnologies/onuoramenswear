insert into public.products (
  slug, name, edition, meaning, price, image, images, palette, page_text, page_muted, page_panel, dark_page, story, story_kicker, story_title, occasion, sort_order
) values
('ebube','EBUBE','Black Edition','Glory','$100','/brand/product-ebube.png',array['/brand/product-ebube.png'],'#1F1F1F','#F7F3E8','#D9CDAF','#2C2823',true,'The black edition speaks in authority. EBUBE is for the man whose entrance changes the room, carrying glory, ceremony, and a sharp evening presence without effort.','EBUBE / Glory','Power that enters softly, then stays in the room.','Evening, ceremony, command presence',10),
('ohuru','ỌHỤRỤ','Cream Edition','Fresh','$100','/brand/product-ohuru.png',array['/brand/product-ohuru.png'],'#E2D2B1','#1F1F1F','#5A3A28','#F7F3E8',false,'Freshness becomes the point of view here. ỌHỤRỤ reads as a clean arrival, a new chapter, and a man moving with clarity, lightness, and calm precision.','ỌHỤRỤ / Fresh','A clean arrival, cut for the man starting again with intention.','Travel, daytime luxury, resort',20),
('ndu','NDỤ','Burgundy Edition','Life','$100','/brand/product-ndu.png',array['/brand/product-ndu.png'],'#5B1E2D','#F7F3E8','#E2D2B1','#6B2A3A',true,'The burgundy edition is a declaration of life. NDỤ carries bloodline, passion, and vitality in a tone that feels warm, expressive, and rooted in legacy.','NDỤ / Life','A rich burgundy pulse for the man who moves with legacy.','Dinner, celebration, heritage moments',30),
('ijeoma','IJEỌMA','Blue Edition','Safe journey','$100','/brand/product-ijeoma.png',array['/brand/product-ijeoma.png'],'#1C2C46','#F7F3E8','#D6C9AA','#263954',true,'Blue carries the feeling of safe passage. IJEỌMA is tailored for travel, destiny, and steady progress, keeping the wearer composed wherever he goes.','IJEỌMA / Safe journey','Travel with calm authority and a sense of direction.','Travel, work, destination occasions',40),
('aja','AJA','Forest Edition','Forest, Sanctuary','$100','/brand/product-aja.png',array['/brand/product-aja.png'],'#183A2E','#F7F3E8','#D7C9A9','#21483A',true,'Forest green turns into sanctuary here. AJA is grounded, protective, and wise, made for a man whose style feels connected to nature and ancestry.','AJA / Sanctuary','Grounded in forest tones, protected by ancestral calm.','Quiet luxury, day events, creative work',50),
('nsuo','NSỤO','White Edition','Water','$100','/brand/product-nsuo.png',array['/brand/product-nsuo.png'],'#F7F3E8','#1F1F1F','#5A3A28','#E2D2B1',false,'Water becomes the mood of the piece. NSỤO is adaptable, calm, and clear, made for men who want softness, confidence, and ritual ease in one look.','NSỤO / Water','Fluid, clear, and composed for effortless ceremony.','Ceremony, resort, warm-weather elegance',60)
on conflict (slug) do update set
  name = excluded.name,
  edition = excluded.edition,
  meaning = excluded.meaning,
  price = excluded.price,
  image = excluded.image,
  images = excluded.images,
  palette = excluded.palette,
  page_text = excluded.page_text,
  page_muted = excluded.page_muted,
  page_panel = excluded.page_panel,
  dark_page = excluded.dark_page,
  story = excluded.story,
  story_kicker = excluded.story_kicker,
  story_title = excluded.story_title,
  occasion = excluded.occasion,
  sort_order = excluded.sort_order,
  updated_at = now();
