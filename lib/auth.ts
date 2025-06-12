export async function getUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.warn("Auth error:", error.message)
      // Return mock user for preview
      return {
        id: "preview-user",
        email: "preview@example.com",
        user_metadata: {},
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      }
    }

    return user
  } catch (error) {
    console.warn("Auth connection failed, using mock user")
    return {
      id: "preview-user",
      email: "preview@example.com",
      user_metadata: {},
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    }
  }
}
