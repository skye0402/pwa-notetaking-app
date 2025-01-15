import { NextResponse, NextRequest } from 'next/server';
import { serverBroadcastService } from '@/lib/serverBroadcastService';
import { Note } from '@/types/note';

export async function GET(request: NextRequest) {
  console.log(`Received request with method: ${request.method}`);
  const encoder = new TextEncoder();

  try {
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(encoder.encode('data: connected\n\n'));

        // Subscribe to broadcast events
        const unsubscribe = serverBroadcastService.subscribe('NOTES_UPDATED', (message) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
          } catch (error) {
            if (error instanceof Error && error.name === 'TypeError' && error.message.includes('Controller is already closed')) {
              console.log('Stream controller is closed, unsubscribing');
            } else {
              console.error('Error enqueueing message:', error);
            }
            unsubscribe();
          }
        });

        // Clean up on close
        return () => {
          console.log('Stream closed, cleaning up');
          unsubscribe();
        };
      },
      cancel() {
        console.log('Stream cancelled by client');
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in SSE handler:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const notes: Note[] = await request.json();
    serverBroadcastService.broadcast('NOTES_UPDATED', notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error broadcasting notes:', error.message);
      return new NextResponse(error.message, { status: 500 });
    }
    console.error('Error broadcasting notes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
