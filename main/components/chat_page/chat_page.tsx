"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

type Message = {
  text: string;
  isBot: boolean;
};

type Conversation = {
  id: number;
  title: string;
  messages: Message[];
};

export default function MunchLAChatbot() {
  const [prompt, setPrompt] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFirstInput, setIsFirstInput] = useState(true);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, title: "Restaurant recommendations", messages: [] },
    { id: 2, title: "Food truck locations", messages: [] },
  ]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      const newMessage: Message = { text: prompt, isBot: false };
      let updatedConversation: Conversation;

      if (currentConversation) {
        updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage],
        };
      } else {
        updatedConversation = {
          id: Date.now(),
          title: prompt.slice(0, 30) + (prompt.length > 30 ? "..." : ""),
          messages: [newMessage],
        };
        setConversations([updatedConversation, ...conversations]);
      }

      setCurrentConversation(updatedConversation);
      setPrompt("");
      setIsFirstInput(false);

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          text: "I'm MunchLA's AI assistant. How can I help you find great food in LA?",
          isBot: true,
        };
        setCurrentConversation((prev) => {
          if (prev) {
            return { ...prev, messages: [...prev.messages, botResponse] };
          }
          return prev;
        });
      }, 1000);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setIsFirstInput(true);
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
                {conversations.map((conv) => (
                  <Button
                    key={conv.id}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => setCurrentConversation(conv)}
                  >
                    {conv.title}
                  </Button>
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
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
        </header>

        <main className="flex-1 overflow-auto p-4 pb-24 flex items-center justify-center">
          <div className="max-w-4xl w-full space-y-8">
            {isFirstInput ? (
              <>
                <h1 className="text-4xl font-bold text-left">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300">
                    Hello, Los Angeles!
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
                {currentConversation?.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        message.isBot
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "bg-purple-500 text-white"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {currentConversation &&
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
              >
                <SendIcon className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
