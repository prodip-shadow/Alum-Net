import { issueBackendToken } from "@/lib/issueBackendToken";

export async function GET() {
  try {
    const token = await issueBackendToken();

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return Response.json({ token });
  } catch (error) {
    console.error('Backend token error:', error);

    return Response.json(
      { error: 'Failed to generate backend token' },
      { status: 500 },
    );
  }
}
