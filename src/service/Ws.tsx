import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";

const WebSocketComponent = () => {
  const [data, setData] = useState("");
  const ws = new WebSocket(
    "wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self"
  ); // Replace with your WebSocket server URL
  useEffect(() => {
    ws.onopen = () => {
      // console.log("WebSocket connected");
      // You can perform actions upon successful connection here
      //   ws.send('Hello, WebSocket Server!');
    };

    ws.onmessage = (event) => {
      // console.log("Received message:", event);
      // Handle incoming messages from the WebSocket server
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", "erorrr");
      // Handle WebSocket errors
    };

    ws.onclose = (event) => {
      // console.log("WebSocket disconnected:", event.code, event);
      // Handle WebSocket closing
    };
    // Clean up WebSocket on component unmount
    return () => {
      ws.close();
    };
  }, [data]);
  const handleClick = () => {
    ws.send("Hello, WebSocket Server!");
    setData("data");
  };
  return (
    <View>
      <Text>WebSocket Example</Text>
      <Button title="submit" onPress={handleClick} />
      {/* Other components */}
    </View>
  );
};

export default WebSocketComponent;
