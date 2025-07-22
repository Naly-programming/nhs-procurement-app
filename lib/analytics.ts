export async function track(event: string, properties: Record<string, any> = {}) {
  const apiUrl = process.env.POSTHOG_API_URL
  const apiKey = process.env.POSTHOG_API_KEY
  if (!apiUrl || !apiKey) return
  try {
    await fetch(`${apiUrl}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ event, properties }),
    })
  } catch (err) {
    console.error('Analytics error', err)
  }
}
