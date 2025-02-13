// apps/web/src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authOptions: NextAuthOptions = {
  // Eliminamos el adapter para evitar el error de getSessionAndUser.
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with credentials:", credentials);
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });
        console.log("User found:", user);

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        console.log("Password match:", passwordMatch);

        if (!passwordMatch) {
          throw new Error("Invalid credentials");
        }

        // Retornamos un objeto de usuario
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          permissions: user.permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback called. Token before:", token, "User:", user);
      if (user) token.id = user.id;
      console.log("JWT callback returning token:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback called. Session before:", session, "Token:", token);
      if (session.user && token.id) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id },
            include: { role: true },
          });
          console.log("User in session callback:", user);
          if (user) {
            session.user = {
              ...session.user,
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role?.name,
              permissions: user.permissions,
            };
          }
        } catch (err) {
          console.error("Error fetching user in session callback:", err);
        }
      }
      console.log("Session callback returning session:", session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
