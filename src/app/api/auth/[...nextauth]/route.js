import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { comparePassword } from "@/lib/auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      async profile(profile) {
        // Find or create user
        const user = await prisma.user.upsert({
          where: { email: profile.email },
          update: { name: profile.name },
          create: {
            email: profile.email,
            name: profile.name,
            role: "user",
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
            agentLimit: 1,
          },
        });
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && user.password && await comparePassword(credentials.password, user.password)) {
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
