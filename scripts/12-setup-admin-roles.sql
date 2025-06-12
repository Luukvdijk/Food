-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the user has admin role in their JWT claims
    RETURN (auth.jwt() ->> 'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policies that override other restrictions
CREATE POLICY "Allow admins full access to recepten" ON recepten
    FOR ALL USING (is_admin());

CREATE POLICY "Allow admins full access to ingredienten" ON ingredienten
    FOR ALL USING (is_admin());

CREATE POLICY "Allow admins full access to bijgerechten" ON bijgerechten
    FOR ALL USING (is_admin());

-- To make a user an admin, you would run:
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}' WHERE email = 'admin@example.com';
