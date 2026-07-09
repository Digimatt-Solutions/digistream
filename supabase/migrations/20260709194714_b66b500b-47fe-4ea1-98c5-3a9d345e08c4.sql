
-- Content storage policies: admins upload/manage, authenticated users can read (signed URLs)
CREATE POLICY "Authenticated can read content"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content');

CREATE POLICY "Admins can upload content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content' AND public.has_role(auth.uid(), 'admin'));
