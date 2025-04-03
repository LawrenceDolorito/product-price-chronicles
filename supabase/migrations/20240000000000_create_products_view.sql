
-- Function to get products with their current prices
CREATE OR REPLACE FUNCTION public.get_products_with_current_price()
RETURNS TABLE (
  prodcode text,
  description text,
  unit text,
  current_price numeric
) 
LANGUAGE SQL
AS $$
  SELECT 
    p.prodcode,
    p.description,
    p.unit,
    (
      SELECT ph.unitprice
      FROM pricehist ph
      WHERE ph.prodcode = p.prodcode
      ORDER BY ph.effdate DESC
      LIMIT 1
    ) as current_price
  FROM product p
  ORDER BY p.prodcode;
$$;
