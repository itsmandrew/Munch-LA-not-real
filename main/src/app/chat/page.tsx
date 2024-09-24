'use client'

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPinIcon,
  CameraIcon,
  ListIcon,
  IceCreamIcon,
  ImageIcon,
  MicIcon,
  PlusIcon,
  MenuIcon,
  ChevronDownIcon,
  GridIcon,
  UtensilsIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ShareIcon,
  MoreHorizontalIcon,
  ChevronRightIcon,
  SendIcon,
  Loader2Icon,
  TrashIcon
} from "lucide-react";
import { fetchUserSessions, fetchNextAvailableChatSession, fetchConversation} from "@/api_callers/getters";
import { useSession } from "next-auth/react";
import { sendMessage } from "@/api_callers/setters";
import { RestaurantCard } from "@/components/restaurant_cards/restaurant_cards";

type Restaurant = {
  name: string;
  address: string;
  rating: number;
  price: string;
  summary: string;
};

type Message = {
  text: string;
  isBot: boolean;
  restaurants?: Restaurant[];
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

type Session = {
  id: string;
  conversation_preview: string;
  last_updated: string;
}

export default function MunchLAChatbot() {
  const [prompt, setPrompt] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFirstInput, setIsFirstInput] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { data: loginInfo } = useSession();
  const [currentChatSession, setCurrentChatSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation]);

  useEffect(() => {
    const fetchChatSession = async (userId: string) => {
      try {
        const session = await fetchNextAvailableChatSession(userId);
        setCurrentChatSession(session);
      } catch (error) {
        console.error('Failed to fetch chat session', error);
      }
    };
  
    if (loginInfo?.user?.email) {
      setUserId(loginInfo.user.email);
      fetchChatSession(loginInfo.user.email);
    }
  }, [loginInfo]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        if (!userId) {
          return;
        }
  
        const response = await fetchUserSessions(userId);
  
        if (!response) {
          throw new Error(`Error: ${response.status}`);
        }
  
        const data: any[] = response['sessions'];
        let sessions: Session[] = [];
        
        sessions = data.map(item => ({
            id: item.session_id,
            conversation_preview: item.conversation_preview,
            last_updated: item.last_updated,
        }));
        setUserSessions(sessions);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      }
    };
  
    fetchSessions();
  }, [userId]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (currentConversation){
      setIsFirstInput(false);
    }
  }, [currentConversation]);
  
  const handleSessionClick = async (sessionId: string) => {
    if (!sessionId || !userId) return;
    setCurrentChatSession(sessionId);
    try {
      const conversation = await fetchConversation(userId, sessionId);
      const messages: Message[] = conversation.map(message => ({
        text: message.message_type === 'ai_message'
          ? message.content.general_response || ''
          : message.content || '',
        isBot: message.message_type === 'ai_message',
        restaurants: message.message_type === 'ai_message' ? message.content.restaurants : undefined,
      }));
      
      const conversationData: Conversation = {
        id: sessionId,
        title: `Chat Session ${sessionId}`,
        messages,
      };
  
      setCurrentConversation(conversationData);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const handleRemoveSession = async (sessionId: string) => {
    // Here you would typically call an API to remove the session
    // For now, we'll just remove it from the local state
    setUserSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    
    // If the removed session was the current one, clear the current conversation
    if (currentChatSession === sessionId) {
      setCurrentConversation(null);
      setCurrentChatSession(null);
      setIsFirstInput(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !userId || !currentChatSession) return;

    setCurrentConversation(prevConversation => ({
      id: prevConversation?.id || currentChatSession,
      title: prevConversation?.title || 'New Conversation',
      messages: [...(prevConversation?.messages || []), { text: prompt, isBot: false }],
    }));

    setIsLoading(true);
    setPrompt('');
    setIsFirstInput(false);

    try {
      const response = await sendMessage(userId, currentChatSession, prompt);
      const { general_response, restaurants } = response['aiResponse'];

      setCurrentConversation(prevConversation => ({
        id: prevConversation?.id || currentChatSession,
        title: prevConversation?.title || 'New Conversation',
        messages: [
          ...(prevConversation?.messages || []),
          { text: general_response, isBot: true, restaurants: restaurants },
        ],
      }));
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const startNewConversation = async () => {
    setCurrentConversation(null);
    setIsFirstInput(true);
  
    if (!userId) {
      console.error("Invalid user ID");
      return;
    }
  
    try {
      const response = await fetchNextAvailableChatSession(userId);
      if (!response.ok) {
        throw new Error(`Error fetching next session: ${response.status}`);
      }
      const data = await response.json();
      setCurrentChatSession(data.next_session_id);
    } catch (error) {
      console.error("Failed to fetch next chat session", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const suggestions = [
    {
      text: "Suggest restaurants with high aura and good vibes for me and my girlfriend!",
      icon: <MapPinIcon className="h-6 w-6" />,
    },
    {
      text: "I dont wanna eat any more burgers find me asian food where pretty blonde asians eat",
      icon: <CameraIcon className="h-6 w-6" />,
    },
    {
      text: "Give me a list of all the best sushi restaurants in Little Tokyo I love sushi lol.",
      icon: <ListIcon className="h-6 w-6" />,
    },
    {
      text: "Please find me the best ice cream shop in Los Angeles, I really like cookies and cream",
      icon: <IceCreamIcon className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-lexend">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap");
        :root {
          --font-lexend: "Lexend", sans-serif;
        }
        body {
          font-family: var(--font-lexend);
        }
      `}</style>
      {/* Sidebar */}
      <aside
        className={`bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-500 dark:text-gray-400"
          >
            {isSidebarExpanded ? (
              <ChevronRightIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
          {isSidebarExpanded && <span className="font-semibold"></span>}
        </div>
        {isSidebarExpanded && (
          <>
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={startNewConversation}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New chat
              </Button>
            </div>
            <ScrollArea className="flex-grow p-4">
              <div className="space-y-2">
                {userSessions.map((session) => (
                  <div key={session.id} className="group relative flex items-center justify-between">
                    <Button
                      variant="ghost"
                      className="w-full text-sm pr-8 flex items-center justify-between"
                      onClick={() => handleSessionClick(session.id)}
                    >
                      {/* Limit the width of the truncated text */}
                      <span className="truncate max-w-[180px]">{session.conversation_preview}</span>
                      
                      {/* The delete button section remains to the right */}
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRemoveSession(session.id)}>
                              <TrashIcon className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Button>
                  </div>
                ))}
            </div>

            </ScrollArea>
            <div className="p-4 mt-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    MunchLA <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>MunchLA Pro</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme}>
                    {isDarkMode ? "Light mode" : "Dark mode"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <header className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <GridIcon className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <UtensilsIcon className="h-6 w-6" />
            </Button>
          </div>
          <Avatar>
            <AvatarImage src={loginInfo?.user?.image ?? ''} alt={loginInfo?.user?.name ?? 'User'} />
            <AvatarFallback>{loginInfo?.user?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-24">
          <div className="max-w-4xl mx-auto space-y-8">
            {isFirstInput ? (
              <>
                <h1 className="text-4xl font-bold text-left">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300">
                    Hello, {loginInfo?.user?.name ? loginInfo.user.name : "there"}!
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 text-left">
                  How can I help you discover LA's culinary delights today?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="bg-gray-100 dark:bg-gray-800 border-none p-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                          {suggestion.icon}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {suggestion.text}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {currentConversation?.messages?.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                        <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                          message.isBot
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                            : "bg-purple-500 text-white"
                        }`}>
                          <p>{message.text}</p>
                        </div>
                      </div>
                      {message.restaurants && (
                        <div className="mt-4 space-y-4">
                          <AnimatePresence>
                            {message.restaurants.map((restaurant, restaurantIndex) => (
                              <motion.div
                                key={restaurantIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: restaurantIndex * 0.1 }}
                              >
                                <RestaurantCard restaurant={restaurant} />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="inline-block p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                      <Loader2Icon className="h-6 w-6 animate-spin text-purple-500" />
                    </div>
                  </div>
                )}
                {currentConversation && currentConversation.messages &&
                  currentConversation.messages.length > 0 && (
                    <div className="flex justify-start space-x-2">
                      <Button variant="ghost" size="icon">
                        <ThumbsUpIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ThumbsDownIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ShareIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </main>

        <div className="p-4 bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            <Input
              type="text"
              placeholder="Ask about LA's food scene..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border-none text-gray-900 dark:text-white pl-4 pr-20 py-7 rounded-full text-sm"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-gray-500 dark:text-gray-400"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-gray-500 dark:text-gray-400"
              >
                <MicIcon className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                ) : (
                  <SendIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}