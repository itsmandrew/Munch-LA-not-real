"use client";

import styles from "./page.module.css";
import ChatPage from "./components/chat_page/chat_page";
import ChatIntro from "./components/new_chat_screen/chat_intro";
import { useSession, signIn } from "next-auth/react";
import LogoutButton from "./components/logout_button/logout_button";

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
