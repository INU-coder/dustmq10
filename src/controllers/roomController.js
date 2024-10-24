import { PrismaClient } from '@prisma/client';
import { generateRoomCode } from '../utils/generateRoomCode.js'; // 방 코드 생성 함수 불러오기

const prisma = new PrismaClient();

const roomController = {};

// 모든 방 목록 가져오기
roomController.getAllRooms = async () => {
  try {
    const roomList = await prisma.room.findMany({
      include: {
        members: true, // 각 방에 속한 멤버(사용자) 정보 포함
      },
    });
    return roomList;
  } catch (error) {
    console.error('방 목록을 가져오는 중 오류 발생:', error);
    throw new Error('방 목록을 불러오는 데 실패했습니다.');
  }
};

// 방 생성
roomController.createRoom = async (roomName) => {
  try {
    const roomCode = generateRoomCode(); // 6자리 무작위 코드 생성
    const newRoom = await prisma.room.create({
      data: {
        roomName,
        roomCode, // 생성된 방 코드 저장
      },
    });
    return newRoom;
  } catch (error) {
    console.error('방 생성 중 오류 발생:', error);
    throw new Error('방 생성에 실패했습니다.');
  }
};

// 방 코드로 방 찾기
roomController.findRoomByCode = async (roomCode) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomCode },
    });
    if (!room) {
      throw new Error('해당 방이 존재하지 않습니다.');
    }
    return room;
  } catch (error) {
    console.error('방 찾기 중 오류 발생:', error);
    throw new Error('방을 찾는 데 실패했습니다.');
  }
};

// 사용자가 방에 참여
roomController.joinRoom = async (roomCode, userId) => {
  try {
    // 방 코드를 사용하여 방 찾기
    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: { members: true },
    });

    if (!room) {
      throw new Error('해당 방이 존재하지 않습니다.');
    }

    // 유저가 방에 없는 경우 방에 추가
    if (!room.members.some((member) => member.userId === userId)) {
      await prisma.room.update({
        where: { roomId: room.roomId },
        data: {
          members: {
            connect: { userId },
          },
        },
      });
    }

    // 유저의 현재 방 ID를 업데이트
    await prisma.user.update({
      where: { userId },
      data: { roomId: room.roomId },
    });

    return room; // 성공적으로 방에 입장했을 때 방 정보를 반환
  } catch (error) {
    console.error('방 참여 중 오류 발생:', error);
    throw new Error('방 참여에 실패했습니다.');
  }
};

// 사용자가 방에서 나감
roomController.leaveRoom = async (roomId, userId) => {
  try {
    // 사용자를 방에서 제거
    await prisma.room.update({
      where: { roomId },
      data: {
        members: {
          disconnect: { userId },
        },
      },
    });

    // 유저의 방 정보 초기화
    await prisma.user.update({
      where: { userId },
      data: { roomId: null }, // 유저가 방에서 나가면 roomId를 null로 설정
    });
  } catch (error) {
    console.error('방 떠나기 중 오류 발생:', error);
    throw new Error('방 떠나기에 실패했습니다.');
  }
};

export default roomController;
