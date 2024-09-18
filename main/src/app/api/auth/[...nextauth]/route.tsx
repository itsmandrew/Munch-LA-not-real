import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const { name, email, image } = user;
        try {
          await dbConnect();
          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            dbUser = await User.create({
              name,
              email,
              image,
              googleId: account.providerAccountId,
              createdAt: new Date(),
              lastLogin: new Date(),
            });
          } else {
            dbUser.lastLogin = new Date();
            dbUser.name = name;
            dbUser.image = image;
            await dbUser.save();
          }

          user.id = dbUser._id.toString();
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        const dbUser = await User.findById(token.sub);
        if (dbUser) {
          session.user.createdAt = dbUser.createdAt.toISOString();
          session.user.lastLogin = dbUser.lastLogin.toISOString();
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
