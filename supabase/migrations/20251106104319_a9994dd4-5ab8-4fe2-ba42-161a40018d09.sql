-- Storage policies for area-photos and equipment-photos
-- Public read access for both buckets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read area photos'
  ) THEN
    CREATE POLICY "Public read area photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'area-photos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read equipment photos'
  ) THEN
    CREATE POLICY "Public read equipment photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'equipment-photos');
  END IF;
END $$;

-- Authenticated users can manage files within their own user-id folder
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users upload to own folder - area'
  ) THEN
    CREATE POLICY "Users upload to own folder - area"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'area-photos' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users update own files - area'
  ) THEN
    CREATE POLICY "Users update own files - area"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'area-photos' AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'area-photos' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own files - area'
  ) THEN
    CREATE POLICY "Users delete own files - area"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'area-photos' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users upload to own folder - equipment'
  ) THEN
    CREATE POLICY "Users upload to own folder - equipment"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'equipment-photos' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users update own files - equipment'
  ) THEN
    CREATE POLICY "Users update own files - equipment"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'equipment-photos' AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'equipment-photos' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own files - equipment'
  ) THEN
    CREATE POLICY "Users delete own files - equipment"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'equipment-photos' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;