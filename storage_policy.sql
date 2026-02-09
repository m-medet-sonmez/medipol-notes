-- Enable Storage
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

-- Policy: Allow public read access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'materials' );

-- Policy: Allow authenticated uploads
create policy "Authenticated Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'materials' and auth.role() = 'authenticated' );

-- Policy: Allow users to update their own files
create policy "Owner Update"
  on storage.objects for update
  using ( bucket_id = 'materials' and auth.uid() = owner )
  with check ( bucket_id = 'materials' and auth.uid() = owner );

-- Policy: Allow users to delete their own files
create policy "Owner Delete"
  on storage.objects for delete
  using ( bucket_id = 'materials' and auth.uid() = owner );
