"use client";
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import Markdown, { ReactMarkdown } from "react-markdown";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";

const ChatBox = ({ messages, onSend }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <Paper
      elevation={2}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "8px",
          backgroundColor: "#ffffff",
          maxHeight: "100vh",
        }}
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                textAlign: msg.sender === "user" ? "right" : "left",
              }}
            >
              <Box
                sx={{
                  maxWidth: "75%",
                  background: msg.sender === "user" ? "#000000" : "#efeeee",
                  color: msg.sender === "user" ? "#fff" : "#000",
                  borderRadius: "8px",
                  padding: "8px",
                }}
              >
                <Box sx={{ whiteSpace: "pre-wrap" }}>
                  <Markdown
                    components={{
                      ul: ({ ...props }) => (
                        <ul
                          {...props}
                          style={{ paddingLeft: "1.5rem", margin: 0 }}
                        />
                      ),
                      ol: ({ ...props }) => (
                        <ol
                          {...props}
                          style={{ paddingLeft: "1.5rem", margin: 0 }}
                        />
                      ),
                    }}
                  >
                    {msg.text}
                  </Markdown>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          display: "flex",
          paddingLeft: "1vw",
          paddingRight: "1vw",
          paddingBottom: "1vw",
          gap: "1vw",
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <IconButton onClick={handleSend}>
          <SendIcon></SendIcon>
        </IconButton>
        {/* <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          sx={{ marginLeft: '8px'}}
        >
          Send
        </Button> */}
      </Box>
    </Paper>
  );
};

export default ChatBox;
