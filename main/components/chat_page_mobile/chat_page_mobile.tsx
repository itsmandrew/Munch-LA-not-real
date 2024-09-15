"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  MapPin,
  Camera,
  List,
  IceCream,
  Plus,
  Menu,
  Grid,
  Utensils,
  ThumbsUp,
  ThumbsDown,
  Share,
  MoreHorizontal,
  Send,
  Moon,
  Sun,
} from "lucide-react"

type Message = {
  text: string
  isBot: boolean
}

type Conversation = {
  id: number
  title: string
  messages: Message[]
}

export default function MunchLAMobileChatbot() {
  const [prompt, setPrompt] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFirstInput, setIsFirstInput] = useState(true)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, title: "Restaurant recommendations", messages: [{text: "hi", isBot: false}, {text: "hey!", isBot: true}] },
    { id: 2, title: "Food truck locations", messages: [] },
  ])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      const newMessage: Message = { text: prompt, isBot: false }
      let updatedConversation: Conversation

      if (currentConversation) {
        updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage],
        }
      } else {
        updatedConversation = {
          id: Date.now(),
          title: prompt.slice(0, 30) + (prompt.length > 30 ? "..." : ""),
          messages: [newMessage],
        }
        setConversations([updatedConversation, ...conversations])
      }

      setCurrentConversation(updatedConversation)
      setPrompt("")
      setIsFirstInput(false)

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          text: "I'm MunchLA's AI assistant. How can I help you find great food in LA?",
          isBot: true,
        }
        setCurrentConversation((prev) => {
          if (prev) {
            return { ...prev, messages: [...prev.messages, botResponse] }
          }
          return prev
        })
      }, 1000)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const startNewConversation = () => {
    setCurrentConversation(null)
    setIsFirstInput(true)
  }

  const suggestions = [
    {
      text: "Suggest restaurants with high aura and good vibes for me and my girlfriend!",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      text: "I don't want to eat any more burgers. Find me Asian food where pretty blonde Asians eat.",
      icon: <Camera className="h-5 w-5" />,
    },
    {
      text: "Give me a list of all the best sushi restaurants in Little Tokyo. I love sushi!",
      icon: <List className="h-5 w-5" />,
    },
    {
      text: "Please find me the best ice cream shop in Los Angeles. I really like cookies and cream.",
      icon: <IceCream className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-lexend">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap");
        :root {
          --font-lexend: "Lexend", sans-serif;
        }
        body {
          font-family: var(--font-lexend);
        }
      `}</style>

      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <SheetHeader>
              <SheetTitle className="text-gray-900 dark:text-gray-100">MunchLA</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <Button variant="outline" className="w-full justify-start text-gray-900 dark:text-gray-100" onClick={startNewConversation}>
                <Plus className="mr-2 h-4 w-4" />
                New chat
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Button
                    key={conv.id}
                    variant="ghost"
                    className="w-full justify-start text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setCurrentConversation(conv)}
                  >
                    {conv.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="absolute bottom-4 left-4 right-4">
              <Button variant="outline" className="w-full justify-between text-gray-900 dark:text-gray-100" onClick={toggleTheme}>
                {isDarkMode ? "Light mode" : "Dark mode"}
                {isDarkMode ? <Sun className="h-4 w-4 ml-2" /> : <Moon className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Grid className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Utensils className="h-6 w-6" />
          </Button>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          {isFirstInput ? (
            <>
              <h1 className="text-3xl font-bold text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300">
                  Hello, Los Angeles!
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
                How can I help you discover LA's culinary delights today?
              </p>

              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 border-none p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                        {suggestion.icon}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.text}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {currentConversation?.messages.map((message, index) => (
                <div key={index} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.isBot
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        : "bg-purple-500 text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {currentConversation && currentConversation.messages.length > 0 && (
                <div className="flex justify-start space-x-2">
                  <Button variant="ghost" size="icon">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0">
        <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Ask about LA's food scene..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 border-none text-gray-900 dark:text-gray-100 pl-4 pr-12 py-3 rounded-full text-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white rounded-full h-9 w-9 flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}