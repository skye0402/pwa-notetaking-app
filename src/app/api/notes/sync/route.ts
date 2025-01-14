import { NextRequest, NextResponse } from 'next/server';
import { broadcastService } from '@/lib/broadcastService';

export async function GET(request: NextRequest) {
  console.log(`Received request with method: ${request.method}`);
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(encoder.encode('data: connected\n\n'));

      // Subscribe to broadcast events
      const unsubscribe = broadcastService.subscribe('NOTES_UPDATED', (message) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
      });

      // Clean up on close
      return () => unsubscribe();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  broadcastService.broadcast('NOTES_UPDATED', data);
  return NextResponse.json({ success: true });
}
