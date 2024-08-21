import styles from "./page.module.css";
import ChatPage from "./components/chat_page";

export default function Home() {
  return (
    <div className="App" style={{ height: "100vh", width: "100vw" }}>
      <ChatPage></ChatPage>
    </div>
  );
}
