import mongoose from 'mongoose';

// Define the schema for individual messages
const MessageSchema = new mongoose.Schema({
  message_type: {
    type: String,
    enum: ['restaurant_data', 'human_message_no_prompt', 'ai_message'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // For varying types of content
    required: true
  },
  timestamp: {
    type: String,
  }
}, { _id: false, versionKey: false }); // Disable automatic _id generation and versionKey

// Define the schema for each session
const SessionSchema = new mongoose.Schema({
  last_updated: {
    type: Date,
    default: Date.now
  },
  messages: [MessageSchema] // Array of messages
}, { _id: false, versionKey: false }); // Disable automatic _id generation and versionKey

// Define the main schema
const ConversationsSchema = new mongoose.Schema({
  _id: String, // Assuming _id is a string, adjust as necessary
  sessions: {
    type: Map,
    of: SessionSchema // Mapping from session ID to session schema
  }
}, { collection: 'conversations' }); // Specify the collection name

// Export the model
export default mongoose.models.Conversations || mongoose.model('Conversations', ConversationsSchema);
