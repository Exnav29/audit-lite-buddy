-- Create audit_projects table
CREATE TABLE public.audit_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  site_address TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  building_type TEXT NOT NULL CHECK (building_type IN ('Office', 'Classroom', 'Hostel', 'Residential', 'Commercial', 'Industrial')),
  auditor_names TEXT[] NOT NULL,
  tariff_ghs_per_kwh DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create areas table
CREATE TABLE public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.audit_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  wattage_w DECIMAL(10,2) NOT NULL,
  hours_per_day DECIMAL(5,2) NOT NULL,
  days_per_week INTEGER NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Working' CHECK (condition IN ('Working', 'Not Working', 'Needs Service')),
  notes TEXT,
  kwh_per_day DECIMAL(10,4) GENERATED ALWAYS AS ((quantity * (wattage_w / 1000.0) * hours_per_day)) STORED,
  kwh_per_month DECIMAL(10,4) GENERATED ALWAYS AS ((quantity * (wattage_w / 1000.0) * hours_per_day * 30)) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create observations table
CREATE TABLE public.observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.audit_projects(id) ON DELETE CASCADE,
  ventilation_condition TEXT,
  comfort_levels TEXT,
  lighting_adequacy TEXT,
  signs_of_waste TEXT,
  maintenance_issues TEXT,
  safety_concerns TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.audit_projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  explanation TEXT,
  estimated_savings_kwh_month DECIMAL(10,4),
  estimated_savings_ghs_month DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_projects
CREATE POLICY "Users can view their own projects" 
ON public.audit_projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.audit_projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.audit_projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.audit_projects FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for areas
CREATE POLICY "Users can view areas in their projects" 
ON public.areas FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = areas.project_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create areas in their projects" 
ON public.areas FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = areas.project_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can update areas in their projects" 
ON public.areas FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = areas.project_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete areas in their projects" 
ON public.areas FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = areas.project_id 
  AND audit_projects.user_id = auth.uid()
));

-- Create policies for equipment
CREATE POLICY "Users can view equipment in their projects" 
ON public.equipment FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.areas 
  JOIN public.audit_projects ON audit_projects.id = areas.project_id
  WHERE areas.id = equipment.area_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create equipment in their projects" 
ON public.equipment FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.areas 
  JOIN public.audit_projects ON audit_projects.id = areas.project_id
  WHERE areas.id = equipment.area_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can update equipment in their projects" 
ON public.equipment FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.areas 
  JOIN public.audit_projects ON audit_projects.id = areas.project_id
  WHERE areas.id = equipment.area_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete equipment in their projects" 
ON public.equipment FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.areas 
  JOIN public.audit_projects ON audit_projects.id = areas.project_id
  WHERE areas.id = equipment.area_id 
  AND audit_projects.user_id = auth.uid()
));

-- Create policies for observations
CREATE POLICY "Users can view observations in their projects" 
ON public.observations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = observations.project_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create observations in their projects" 
ON public.observations FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = observations.project_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can update observations in their projects" 
ON public.observations FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = observations.project_id 
  AND audit_projects.user_id = auth.uid()
));

-- Create policies for recommendations
CREATE POLICY "Users can view recommendations in their projects" 
ON public.recommendations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = recommendations.project_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create recommendations in their projects" 
ON public.recommendations FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = recommendations.project_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can update recommendations in their projects" 
ON public.recommendations FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = recommendations.project_id 
  AND audit_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete recommendations in their projects" 
ON public.recommendations FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.audit_projects 
  WHERE audit_projects.id = recommendations.project_id 
  AND audit_projects.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_audit_projects_updated_at
BEFORE UPDATE ON public.audit_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();