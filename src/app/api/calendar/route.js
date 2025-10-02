// app/api/calendar/route.js (App Router)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get("calendarId") || "primary";

  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // Get events for today
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?key=${apiKey}&timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 400 });
    }

    // Format events for the frontend
    const events =
      data.items?.map((event) => {
        const start = new Date(event.start.dateTime || event.start.date);
        const end = new Date(event.end.dateTime || event.end.date);
        const durationMs = end - start;
        const durationMins = Math.round(durationMs / 60000);

        let duration;
        if (durationMins < 60) {
          duration = `${durationMins} mins`;
        } else {
          const hours = Math.floor(durationMins / 60);
          const mins = durationMins % 60;
          duration = mins > 0 ? `${hours}.5 hours` : `${hours} hour${hours > 1 ? "s" : ""}`;
        }

        return {
          id: event.id,
          title: event.summary || "Untitled Event",
          time: start.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          duration: duration,
          startTime: event.start.dateTime || event.start.date,
        };
      }) || [];

    return Response.json({ events });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
