export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const mood = searchParams.get("mood")

    if (!mood) {
      return Response.json({ error: "Mood parameter is required" }, { status: 400 })
    }

    // Define negative emotions that should use calming keywords instead
    const negativeEmotions = [
      "sad",
      "depressed",
      "anxious",
      "worried",
      "stressed",
      "angry",
      "frustrated",
      "overwhelmed",
      "lonely",
      "hopeless",
      "fearful",
      "panic",
      "grief",
      "hurt",
      "disappointed",
      "rejected",
      "abandoned",
      "worthless",
      "guilty",
      "ashamed",
    ]

    const calmingKeywords = ["nature", "calm", "sunlight", "forest", "ocean", "peaceful", "serene"]

    // Check if the mood contains negative emotions
    const moodLower = mood.toLowerCase()
    const isNegativeEmotion = negativeEmotions.some((emotion) => moodLower.includes(emotion))

    // Use calming keywords for negative emotions, original mood for positive ones
    const searchTerm = isNegativeEmotion ? calmingKeywords[Math.floor(Math.random() * calmingKeywords.length)] : mood

    // Unsplash API endpoint
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=9&orientation=landscape&content_filter=high`

    const response = await fetch(unsplashUrl, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch images from Unsplash")
    }

    const data = await response.json()

    // Transform the response to only include what we need
    const images = data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.small,
      fullUrl: photo.urls.regular,
      alt: photo.alt_description || `${searchTerm} image`,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    }))

    return Response.json({ images })
  } catch (error) {
    console.error("Error fetching images:", error)
    return Response.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
