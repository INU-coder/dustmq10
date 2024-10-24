import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './ChatPage.css';

const socket = io('http://localhost:8080'); // 포트 번호를 8080으로 변경

const ChatPage = ({ user }) => {
  const { roomId } = useParams(); // URL에서 방 ID 가져오기
  const navigate = useNavigate(); // 다른 페이지로 이동하기 위한 hook
  const [message, setMessage] = useState(''); // 입력된 메시지 상태
  const [messageList, setMessageList] = useState([]); // 수신한 메시지 리스트 상태

  useEffect(() => {
    // 방에 입장
    socket.emit('joinRoom', roomId, (response) => {
      if (response.ok) {
        console.log('Successfully joined the room.');
      } else {
        console.error('Failed to join room:', response.error);
        navigate('/'); // 입장 실패 시 메인 페이지로 리다이렉션
      }
    });

    // 서버로부터 메시지를 수신할 때마다 리스트 업데이트
    socket.on('message', (newMessage) => {
      setMessageList((prevList) => [...prevList, newMessage]);
    });

    // 컴포넌트가 언마운트될 때 방 떠나기
    return () => {
      socket.emit('leaveRoom', { roomId, userId: user.userId }, (response) => {
        if (response.ok) {
          console.log('Successfully left the room.');
        }
      });
    };
  }, [roomId, user.userId, navigate]);

  // 메시지 전송 함수
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('sendMessage', message, (response) => {
        if (response.ok) {
          setMessage(''); // 전송 후 메시지 입력창 초기화
        } else {
          console.error('Failed to send message:', response.error);
        }
      });
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ←
        </button>
        <h2>{`방 ID: ${roomId}`}</h2>
      </header>

      <div className="chat-window">
        <div className="message-list">
          {messageList.map((msg, index) => (
            <div key={index} className="message-item">
              <span className="message-user">{msg.user.name}:</span>
              <span className="message-text">{msg.message}</span>
            </div>
          ))}
        </div>

        <form className="message-form" onSubmit={sendMessage}>
          <input
            type="text"
            className="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <button type="submit" className="send-button">
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
