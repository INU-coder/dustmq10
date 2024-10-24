import React, { useState } from 'react';

const CreateRoomPage = () => {
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const createRoom = async () => {
    try {
      const response = await fetch('http://localhost:8080/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      });
      const data = await response.json();
      if (response.ok) {
        setRoomCode(data.roomCode); // 서버에서 받은 방 코드를 설정
        setError(''); // 에러 초기화
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('방 생성에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2>채팅방 생성</h2>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="방 이름을 입력하세요"
      />
      <button onClick={createRoom}>방 생성</button>

      {roomCode && (
        <div>
          <p>
            방 코드: <strong>{roomCode}</strong>
          </p>
          <p>이 코드를 다른 사람과 공유하세요.</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateRoomPage;
