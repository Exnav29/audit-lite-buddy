-- Create trigger function to automatically calculate energy consumption
CREATE OR REPLACE FUNCTION public.calculate_equipment_energy()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate kWh per day: (quantity * wattage_w * hours_per_day) / 1000
  NEW.kwh_per_day := (NEW.quantity * NEW.wattage_w * NEW.hours_per_day) / 1000.0;
  
  -- Calculate kWh per month: kwh_per_day * (days_per_week / 7) * 30
  NEW.kwh_per_month := NEW.kwh_per_day * (NEW.days_per_week / 7.0) * 30.0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert or update on equipment table
DROP TRIGGER IF EXISTS trigger_calculate_equipment_energy ON public.equipment;

CREATE TRIGGER trigger_calculate_equipment_energy
  BEFORE INSERT OR UPDATE OF quantity, wattage_w, hours_per_day, days_per_week
  ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_equipment_energy();