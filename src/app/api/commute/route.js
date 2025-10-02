// app/api/commute/route.js (App Router)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const originEncoded = encodeURIComponent(origin);
    const destEncoded = encodeURIComponent(destination);
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originEncoded}&destinations=${destEncoded}&departure_time=now&traffic_model=best_guess&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const result = data.rows[0].elements[0];

      return Response.json({
        duration: result.duration.text,
        durationValue: result.duration.value,
        distance: result.distance.text,
        traffic: result.duration_in_traffic?.text || result.duration.text,
      });
    }

    return Response.json({ error: "Failed to fetch commute data" }, { status: 400 });
  } catch (error) {
    console.error("Commute fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
