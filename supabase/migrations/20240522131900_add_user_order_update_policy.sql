-- Allow authenticated users to update their own orders (e.g. for cancellation)
CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
