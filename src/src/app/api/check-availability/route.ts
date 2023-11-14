export async function GET(request: Request) {
    return new Response(JSON.stringify({ available: false }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
