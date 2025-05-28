import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';

const WebSocketComponent = () => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [topic, setTopic] = useState('test');
  const clientRef = useRef(null);

  // MQTT connection options


  const options = {
    host: process.env.REACT_APP_MQTT_HOST,
    path: '/mqtt', // Add this line
    port: process.env.REACT_APP_MQTT_PORT,
    protocol: 'wss',
    username: process.env.REACT_APP_MQTT_USER,
    password: process.env.REACT_APP_MQTT_PASS,
    clientId: 'MUSTAFA_WC',
  };

  useEffect(() => {
    // Connect to MQTT broker
    clientRef.current = mqtt.connect(options);

    clientRef.current.on('connect', () => {
      console.log('Connected to MQTT broker');
      setIsConnected(true);
      // Subscribe to the topic when connected
      clientRef.current.subscribe(topic, (err) => {
        if (!err) {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });

    clientRef.current.on('message', (receivedTopic, message) => {
      console.log(`Received message on ${receivedTopic}: ${message.toString()}`);
      setMessages(prev => [...prev, {
        topic: receivedTopic,
        message: message.toString(),
        timestamp: new Date().toLocaleTimeString()
      }]);
    });

    clientRef.current.on('error', (err) => {
      console.error('Connection error:', err);
      setIsConnected(false);
    });

    clientRef.current.on('close', () => {
      console.log('Connection closed');
      setIsConnected(false);
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, [topic]);

  const handlePublish = () => {
    if (clientRef.current && isConnected && inputMessage.trim()) {
      clientRef.current.publish(topic, inputMessage, (err) => {
        if (!err) {
          console.log(`Message published to ${topic}`);
          setInputMessage('');
        }
      });
    }
  };

  const handleSubscribe = (newTopic) => {
    if (clientRef.current && isConnected && newTopic.trim()) {
      clientRef.current.subscribe(newTopic, (err) => {
        if (!err) {
          console.log(`Subscribed to ${newTopic}`);
          setTopic(newTopic);
        }
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>MQTT WebSocket Client</h2>
      <div style={{ marginBottom: '20px' }}>
        <p>Status:
          <span style={{
            color: isConnected ? 'green' : 'red',
            fontWeight: 'bold',
            marginLeft: '8px'
          }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </p>
        <p>Current Topic: <strong>{topic}</strong></p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Subscribe to New Topic:</h3>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic to subscribe"
          style={{ padding: '8px', marginRight: '8px', width: '300px' }}
        />
        <button
          onClick={() => handleSubscribe(topic)}
          style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Update Subscription
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Publish Message:</h3>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message"
          style={{ padding: '8px', marginRight: '8px', width: '300px' }}
          onKeyPress={(e) => e.key === 'Enter' && handlePublish()}
        />
        <button
          onClick={handlePublish}
          disabled={!isConnected}
          style={{
            padding: '8px 16px',
            backgroundColor: isConnected ? '#2196F3' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed'
          }}
        >
          Publish
        </button>
      </div>

      <div>
        <h3>Received Messages:</h3>
        {messages.length === 0 ? (
          <p>No messages received yet...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {messages.map((msg, index) => (
              <li key={index} style={{
                padding: '10px',
                margin: '5px 0',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
              }}>
                <strong>[{msg.timestamp}] {msg.topic}:</strong> {msg.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WebSocketComponent;