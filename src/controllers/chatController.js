import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const chatController = {};

// 채팅 메시지 저장 함수
chatController.saveChat = async (message, userId, roomId) => {
  try {
    // 데이터베이스에 채팅 메시지 저장
    const newChat = await prisma.chat.create({
      data: {
        message,
        userId, // 메시지를 보낸 유저의 ID
        roomId, // 유저가 속한 채팅방 ID
      },
      include: {
        user: true, // 유저 정보를 포함하여 반환
      },
    });

    // 저장된 메시지를 반환
    return newChat;
  } catch (error) {
    console.error('채팅 메시지 저장 중 오류 발생:', error);
    throw new Error('채팅 메시지 저장 실패');
  }
};

export default chatController;
