import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Star, MapPin, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Restaurant = {
  name: string;
  address: string;
  rating: number;
  price: string;
  summary: string;
};

type MessageProps = {
  isBot: boolean;
  text: string;
  restaurants?: Restaurant[];
};

export default function AIResponse({ isBot, text, restaurants }: MessageProps) {
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`inline-block p-4 rounded-lg max-w-[80%] ${
          isBot
            ? "bg-background shadow-md"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="mb-4">{text}</p>
        {restaurants && restaurants.length > 0 && (
          <div className="grid gap-6 mt-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={index} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{restaurant.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{restaurant.address}</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-400" />
            <span className="text-sm font-medium">{restaurant.rating}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-sm font-medium">{restaurant.price}</span>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={{
                expanded: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 }
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <p className="text-sm text-muted-foreground mb-4">{restaurant.summary}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show More
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}