-- Fix search_path security issue for calculate_equipment_energy function
CREATE OR REPLACE FUNCTION public.calculate_equipment_energy()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Calculate kWh per day: (quantity * wattage_w * hours_per_day) / 1000
  NEW.kwh_per_day := (NEW.quantity * NEW.wattage_w * NEW.hours_per_day) / 1000.0;
  
  -- Calculate kWh per month: kwh_per_day * (days_per_week / 7) * 30
  NEW.kwh_per_month := NEW.kwh_per_day * (NEW.days_per_week / 7.0) * 30.0;
  
  RETURN NEW;
END;
$$;