
-- 1. Profiles: restrict SELECT
DROP POLICY IF EXISTS "profiles select all authed" ON public.profiles;

CREATE POLICY "profiles select own or shared business"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.is_staff(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.business_members bm_self
    JOIN public.business_members bm_other
      ON bm_self.business_id = bm_other.business_id
    WHERE bm_self.user_id = auth.uid()
      AND bm_other.user_id = public.profiles.id
  )
);

-- 2. Notifications: only staff can insert
DROP POLICY IF EXISTS "notifications staff insert" ON public.notifications;

CREATE POLICY "notifications staff insert"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

-- 3. Storage: allow business members to delete their own uploads
DROP POLICY IF EXISTS "ws-files member delete own" ON storage.objects;

CREATE POLICY "ws-files member delete own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'workspace-files'
  AND owner = auth.uid()
  AND public.is_business_member(auth.uid(), (split_part(name, '/', 1))::uuid)
);

-- 4. Realtime: lock down broadcast/presence subscriptions to staff
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'realtime' AND c.relname = 'messages'
  ) THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "realtime staff only" ON realtime.messages';
    EXECUTE $p$CREATE POLICY "realtime staff only"
      ON realtime.messages
      FOR SELECT
      TO authenticated
      USING (public.is_staff(auth.uid()))$p$;
  END IF;
END$$;
