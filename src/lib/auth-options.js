import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: (process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID || "").replace(/"/g, '').trim(),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET || "").replace(/"/g, '').trim(),
      async profile(profile) {
        try {
          if (!profile.email) {
            throw new Error("No email found in Google profile");
          }
          
          const user = await prisma.user.upsert({
            where: { email: profile.email },
            update: { name: profile.name },
            create: {
              email: profile.email,
              name: profile.name,
              role: "user",
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              agentLimit: 1,
            },
          });
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (error) {
          console.error("CRITICAL AUTH ERROR (Profile Callback):", error);
          throw error;
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
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
        token.email = user.email;
      } 
      if (token.email === 'jisunahamed525@gmail.com') {
        token.role = 'admin';
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true }
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: "jwt" }
};
