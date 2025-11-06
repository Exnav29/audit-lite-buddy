-- Create storage buckets for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('area-photos', 'area-photos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('equipment-photos', 'equipment-photos', true);

-- Add photo_url columns to areas and equipment tables
ALTER TABLE public.areas 
ADD COLUMN photo_url text;

ALTER TABLE public.equipment 
ADD COLUMN photo_url text;

-- Create storage policies for area photos
CREATE POLICY "Area photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'area-photos');

CREATE POLICY "Users can upload area photos for their projects" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'area-photos' AND
  EXISTS (
    SELECT 1 FROM areas
    JOIN audit_projects ON audit_projects.id = areas.project_id
    WHERE audit_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update area photos for their projects" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'area-photos' AND
  EXISTS (
    SELECT 1 FROM areas
    JOIN audit_projects ON audit_projects.id = areas.project_id
    WHERE audit_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete area photos for their projects" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'area-photos' AND
  EXISTS (
    SELECT 1 FROM areas
    JOIN audit_projects ON audit_projects.id = areas.project_id
    WHERE audit_projects.user_id = auth.uid()
  )
);

-- Create storage policies for equipment photos
CREATE POLICY "Equipment photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'equipment-photos');

CREATE POLICY "Users can upload equipment photos for their projects" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'equipment-photos' AND
  EXISTS (
    SELECT 1 FROM equipment
    JOIN areas ON areas.id = equipment.area_id
    JOIN audit_projects ON audit_projects.id = areas.project_id
    WHERE audit_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update equipment photos for their projects" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'equipment-photos' AND
  EXISTS (
    SELECT 1 FROM equipment
    JOIN areas ON areas.id = equipment.area_id
    JOIN audit_projects ON audit_projects.id = areas.project_id
    WHERE audit_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete equipment photos for their projects" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'equipment-photos' AND
  EXISTS (
    SELECT 1 FROM equipment
    JOIN areas ON areas.id = equipment.area_id
    JOIN audit_projects ON audit_projects.id = areas.project_id
    WHERE audit_projects.user_id = auth.uid()
  )
);