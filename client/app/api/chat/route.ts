export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Request body:", body);
    const result = {
      text: "Hello! This is a test API response from your server 🚀",
    };

    return new Response(
      JSON.stringify({
        message: "hello",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Something went wrong",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
