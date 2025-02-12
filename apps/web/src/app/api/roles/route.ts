import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Retrieve all roles
export async function GET() {
  try {
    console.log("Fetching roles from the database...");
    const roles = await prisma.role.findMany();

    if (!roles || roles.length === 0) {
      return NextResponse.json({ message: "No roles available" }, { status: 404 });
    }

    console.log("Roles retrieved:", roles);
    return NextResponse.json({ message: "Roles retrieved successfully", data: roles });
  } catch (error: unknown) {
    console.error("Error retrieving roles:", error);
    return NextResponse.json({ message: "Error retrieving roles", error: String(error) }, { status: 500 });
  }
}

// POST: Create a new role
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body received:", body);

    if (!body.name) {
      return NextResponse.json({ message: "Role name is required" }, { status: 400 });
    }

    const existingRole = await prisma.role.findUnique({ where: { name: body.name } });

    if (existingRole) {
      return NextResponse.json({ message: "Role already exists" }, { status: 409 });
    }

    const newRole = await prisma.role.create({
      data: { name: body.name },
    });

    console.log("New role created:", newRole);
    return NextResponse.json({ message: "Role created successfully", data: newRole }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating role:", error);
    return NextResponse.json({ message: "Error creating role", error: String(error) }, { status: 500 });
  }
}

// PUT: Update an existing role
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body received:", body);

    if (!body.id || !body.name) {
      return NextResponse.json({ message: "Role ID and new name are required" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { id: body.id } });

    if (!role) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 });
    }

    const updatedRole = await prisma.role.update({
      where: { id: body.id },
      data: { name: body.name },
    });

    console.log("Role updated:", updatedRole);
    return NextResponse.json({ message: "Role updated successfully", data: updatedRole });
  } catch (error: unknown) {
    console.error("Error updating role:", error);
    return NextResponse.json({ message: "Error updating role", error: String(error) }, { status: 500 });
  }
}

// DELETE: Remove a role by ID
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    console.log("Role ID received for deletion:", id);

    if (!id) {
      return NextResponse.json({ message: "Role ID is required" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { id } });

    if (!role) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 });
    }

    await prisma.role.delete({ where: { id } });

    console.log("Role successfully deleted");
    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting role:", error);
    return NextResponse.json({ message: "Error deleting role", error: String(error) }, { status: 500 });
  }
}
