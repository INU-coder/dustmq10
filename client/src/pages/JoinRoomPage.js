import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoomPage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const joinRoom = async () => {
    try {
      const response = await fetch('http://localhost:8080/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate(`/chat/${data.roomId}`); // 채팅방으로 이동
        setError(''); // 에러 초기화
      } else {
        setError(data.message); // 서버에서 받은 에러 메시지
      }
    } catch (error) {
      setError('방 입장에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2>채팅방 입장</h2>
      <input
        type="text"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="방 코드를 입력하세요"
      />
      <button onClick={joinRoom}>방 입장</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default JoinRoomPage;
