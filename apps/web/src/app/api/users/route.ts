import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: Retrieve all users
export async function GET() {
  try {
    console.log("Fetching users from the database...");
    const users = await prisma.user.findMany({
      include: { role: true },
    });

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users available" }, { status: 404 });
    }

    console.log("Users retrieved:", users);
    return NextResponse.json({ message: "Users retrieved successfully", data: users });
  } catch (error: unknown) {
    console.error("Error retrieving users:", error);
    return NextResponse.json({ message: "Error retrieving users", error: String(error) }, { status: 500 });
  }
}

// POST: Create a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body received:", body);

    const { name, email, password, roleId, permissions } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json(
        { message: "Name, email, password, and role ID are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Usamos la contraseña encriptada
        roleId,
        permissions: permissions || [],
      },
    });

    console.log("New user created:", newUser);
    return NextResponse.json(
      { message: "User created successfully", data: newUser },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user", error: String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update an existing user
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body received:", body);

    const { id, name, email, password, roleId, permissions } = body;

    if (!id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, password, roleId, permissions },
    });

    console.log("User updated:", updatedUser);
    return NextResponse.json({ message: "User updated successfully", data: updatedUser });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Error updating user", error: String(error) }, { status: 500 });
  }
}

// DELETE: Remove a user by ID
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    console.log("User ID received for deletion:", id);

    if (!id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    console.log("User successfully deleted");
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Error deleting user", error: String(error) }, { status: 500 });
  }
}
