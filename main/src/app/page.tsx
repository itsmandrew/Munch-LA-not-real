"use client";

import { useEffect, useState } from "react";
import ChatPage from "@/components/chat_page/chat_page";
import ChatPageMobile from "@/components/chat_page_mobile/chat_page_mobile";
import LandingPage from "@/components/landing_page/landing-page";

export default function Home() {
  // const [isMobile, setIsMobile] = useState(false);

  // useEffect(() => {
  //   // Function to check if the screen width is mobile size
  //   const checkIfMobile = () => {
  //     setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
  //   };

  //   // Initial check
  //   checkIfMobile();

  //   // Add event listener to check on window resize
  //   window.addEventListener("resize", checkIfMobile);

  //   // Cleanup event listener on component unmount
  //   return () => {
  //     window.removeEventListener("resize", checkIfMobile);
  //   };
  // }, []);

  // return isMobile ? <ChatPageMobile /> : <ChatPage />;
  return(
    <div style={{height: '100vh'}}>
      {/* <LandingPage></LandingPage> */}
      <ChatPage></ChatPage>
    </div>
    
  );
  
}
