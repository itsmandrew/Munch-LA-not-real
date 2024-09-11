"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, LogOut, Plus, Trash2, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  id: number
  text: string
  sender: "user" | "ai"
}

type Conversation = {
  id: number
  name: string
  lastMessage: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: "ai" },
  ])
  const [input, setInput] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, name: "General Inquiry", lastMessage: "Hello! How can I assist you today?" },
    { id: 2, name: "Technical Support", lastMessage: "Have you tried turning it off and on again?" },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      const newUserMessage: Message = {
        id: messages.length + 1,
        text: input.trim(),
        sender: "user",
      }
      setMessages([...messages, newUserMessage])
      setInput("")

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          text: `I understood your message: "${input.trim()}". How else can I help?`,
          sender: "ai",
        }
        setMessages((prevMessages) => [...prevMessages, aiResponse])
      }, 1000)
    }
  }

  const handleDeleteConversation = (id: number) => {
    setConversations(conversations.filter(conv => conv.id !== id))
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Navbar */}
      <motion.nav 
        className="bg-purple-800 text-white p-4 flex justify-between items-center"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1 className="text-xl font-bold">ChatBot Dashboard</h1>
        <Button variant="ghost" className="text-white hover:text-purple-200 transition-colors duration-200">
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </motion.nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside 
          className="w-64 bg-purple-700 p-4 overflow-y-auto"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Conversations</h2>
            <Button size="sm" variant="ghost" className="text-white hover:bg-purple-600 transition-colors duration-200">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <AnimatePresence>
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="mb-2 rounded-lg overflow-hidden"
              >
                <div className="group relative bg-purple-600 hover:bg-purple-500 transition-colors duration-200 p-2 rounded-lg cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-purple-200" />
                      <div>
                        <h3 className="font-medium text-white">{conversation.name}</h3>
                        <p className="text-sm text-purple-200 truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-purple-200 hover:bg-purple-400 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteConversation(conversation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.aside>

        {/* Main chat area */}
        <main className="flex-1 flex flex-col bg-gradient-to-br from-purple-800 to-indigo-900 p-4">
          <Card className="flex-1 flex flex-col bg-purple-900/50 backdrop-blur-md border-purple-500 overflow-hidden rounded-xl shadow-lg">
            <CardHeader className="border-b border-purple-700">
              <CardTitle className="text-white">Current Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-4">
              <ScrollArea className="h-full pr-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`flex items-end ${
                          message.sender === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={
                              message.sender === "user"
                                ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFA500' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"
                                : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234B0082' d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm0 8a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm0-4a1 1 0 1 0 1 1 1 1 0 0 0-1-1z'/%3E%3C/svg%3E"
                            }
                            alt={message.sender === "user" ? "User" : "AI"}
                          />
                          <AvatarFallback>
                            {message.sender === "user" ? "U" : "AI"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`mx-2 p-3 rounded-lg ${
                            message.sender === "user"
                              ? "bg-purple-500 text-white"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t border-purple-700 flex items-center justify-center pt-[1.5rem]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex w-full max-w-full items-center space-x-2"
              >
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow bg-purple-800/50 text-white placeholder-purple-300 border-purple-600 focus:ring-purple-500 focus:border-purple-500"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-purple-500 hover:bg-purple-400 text-white transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
          </CardFooter>

          </Card>
        </main>
      </div>
    </div>
  )
}