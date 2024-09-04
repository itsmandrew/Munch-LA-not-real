"use client";
import { useSession, signIn } from "next-auth/react";
import LogoutButton from "./components/logout_button/logout_button";
import ChatPage from "./components/chat_page";
export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="App" style={{ height: "100vh", width: "100vw" }}>
      {session ? (
        <>
          <ChatPage session={session}></ChatPage>
          <LogoutButton />
        </>
      ) : (
        <div>              
          <h1>Please sign in</h1>
          <button onClick={() => signIn('google')}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}