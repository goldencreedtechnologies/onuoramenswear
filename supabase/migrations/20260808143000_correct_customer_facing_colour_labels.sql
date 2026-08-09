update public.products
set
  color_name = case slug
    when 'aja' then 'Forest'
    when 'nsuo' then 'Off-White'
    when 'ohuru' then 'Sahara Beige'
    else color_name
  end,
  edition = case slug
    when 'aja' then 'Forest Edition'
    when 'nsuo' then 'Off-White Edition'
    when 'ohuru' then 'Sahara Beige Edition'
    else edition
  end
where slug in ('aja', 'nsuo', 'ohuru');
