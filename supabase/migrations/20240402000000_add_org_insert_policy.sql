-- Add insert policy for organizations
create policy "Users can create organizations"
    on organizations for insert
    with check (true);  -- Allow any authenticated user to create an organization 