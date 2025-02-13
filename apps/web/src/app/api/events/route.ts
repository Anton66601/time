// apps/web/src/app/api/events/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Retrieve all events (with associated user information)
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: { user: true },
    });

    if (!events || events.length === 0) {
      return NextResponse.json({ message: "No events available" }, { status: 404 });
    }

    return NextResponse.json({ message: "Events retrieved successfully", data: events });
  } catch (error: unknown) {
    console.error("Error retrieving events:", error);
    return NextResponse.json({ message: "Error retrieving events", error: String(error) }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, description, date } = body;

    if (!userId || !title || !description || !date) {
      return NextResponse.json({ message: "userId, title, description, and date are required" }, { status: 400 });
    }

    // Optionally: check that the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newEvent = await prisma.event.create({
      data: {
        userId,
        title,
        description,
        date: new Date(date), // Ensure the date is valid
      },
    });

    return NextResponse.json({ message: "Event created successfully", data: newEvent }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating event:", error);
    return NextResponse.json({ message: "Error creating event", error: String(error) }, { status: 500 });
  }
}

// PUT: Update an existing event
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, description, date } = body;

    if (!id) {
      return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
    }

    // Check that the event exists
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title || existingEvent.title,
        description: description || existingEvent.description,
        date: date ? new Date(date) : existingEvent.date,
      },
    });

    return NextResponse.json({ message: "Event updated successfully", data: updatedEvent });
  } catch (error: unknown) {
    console.error("Error updating event:", error);
    return NextResponse.json({ message: "Error updating event", error: String(error) }, { status: 500 });
  }
}

// DELETE: Delete an event by ID
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
    }

    // Check that the event exists
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ message: "Error deleting event", error: String(error) }, { status: 500 });
  }
}
