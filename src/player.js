import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// 공격력 계산 함수
function sumAttackPower(level, baseAttackPower) {
  const multiplier = 1 + (level - 1) * 0.1; // 레벨 기반 배율 계산
  return Math.round(baseAttackPower * multiplier); // 배율 적용 후 반올림
}

// 캐릭터 장착 함수
async function equipCharacter(userId, characterId) {
  try {
    const intUserId = parseInt(userId, 10);
    const intCharacterId = parseInt(characterId, 10);

    // 모든 플레이어에서 장착된 캐릭터를 해제 (equippedItemId 초기화는 불필요함)
    await prisma.player.updateMany({
      where: { userId: intUserId },
      data: { equippedItemId: null }, // 기존 장착 아이템 해제
    });

    // 새 캐릭터 장착
    const updatedPlayers = await prisma.player.updateMany({
      where: {
        userId: intUserId,
        characterId: intCharacterId,
      },
      data: { characterId: intCharacterId },
    });

    const character = await prisma.character.findUnique({
      where: { id: intCharacterId },
    });

    if (updatedPlayers.count > 0 && character) {
      console.log(
        `캐릭터 장착 성공: userId ${intUserId}, characterId ${intCharacterId}`
      );
      return { success: true, characterName: character.name };
    } else {
      console.log('캐릭터를 찾을 수 없습니다.');
      return { success: false, message: '캐릭터를 찾을 수 없습니다.' };
    }
  } catch (error) {
    console.error('캐릭터 장착 오류:', error);
    return { success: false, message: '캐릭터 장착 중 오류가 발생했습니다.' };
  }
}

// 유저 플레이어 생성 함수
async function createPlayer(userId, characterId) {
  try {
    const existingPlayer = await prisma.player.findFirst({
      where: {
        userId: parseInt(userId, 10),
        characterId: parseInt(characterId, 10),
      },
    });

    if (existingPlayer) {
      console.log('플레이어가 이미 존재합니다.');
      return existingPlayer;
    }

    // 캐릭터 정보 가져오기
    const character = await prisma.character.findUnique({
      where: { id: parseInt(characterId, 10) },
    });
    if (!character) throw new Error('해당 캐릭터를 찾을 수 없습니다.');

    // 새 플레이어 생성
    const playerLevel = 1;
    const newPlayer = await prisma.player.create({
      data: {
        userId: parseInt(userId, 10),
        characterId: parseInt(characterId, 10),
        level: playerLevel,
        exp: 0,
        equippedItemId: null,
      },
    });

    const attackPower = sumAttackPower(playerLevel, character.power);
    console.log(`플레이어 생성 성공, 캐릭터 공격력: ${attackPower}`);
    return { ...newPlayer, attackPower };
  } catch (error) {
    console.error('플레이어 생성 오류:', error);
    throw new Error('플레이어 생성 중 오류가 발생했습니다.');
  }
}

// 플레이어 업데이트 함수
async function updatePlayer(playerId, newLevel) {
  try {
    const player = await prisma.player.findUnique({
      where: { playerId: parseInt(playerId, 10) },
      include: { character: true },
    });

    if (!player) throw new Error('플레이어를 찾을 수 없습니다.');

    const newAttackPower = sumAttackPower(newLevel, player.character.power);

    const updatedPlayer = await prisma.player.update({
      where: { playerId: parseInt(playerId, 10) },
      data: { level: newLevel },
    });

    console.log(
      `플레이어 레벨 업데이트 성공, 새로운 공격력: ${newAttackPower}`
    );
    return { ...updatedPlayer, newAttackPower };
  } catch (error) {
    console.error('플레이어 업데이트 오류:', error);
    throw new Error('플레이어 업데이트 중 오류가 발생했습니다.');
  }
}

// 아이템 장착 함수
async function equipItem(playerId, itemId) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId, 10) },
    });

    if (!item) throw new Error('해당 아이템을 찾을 수 없습니다.');

    // 기존 장착 아이템 해제 후 새로운 아이템 장착
    const updatedPlayer = await prisma.player.update({
      where: { playerId: parseInt(playerId, 10) },
      data: { equippedItemId: parseInt(itemId, 10) },
      include: { equippedItem: true },
    });

    console.log('아이템 장착 성공:', updatedPlayer);
    return updatedPlayer;
  } catch (error) {
    console.error('아이템 장착 오류:', error);
    throw new Error('아이템 장착 중 오류가 발생했습니다.');
  }
}

// 플레이어 정보 조회 함수
async function getPlayer(playerId) {
  try {
    const player = await prisma.player.findUnique({
      where: { playerId: parseInt(playerId, 10) },
      include: { equippedItem: true },
    });
    return player || null;
  } catch (error) {
    console.error('플레이어 정보 조회 오류:', error);
    throw new Error('플레이어 정보 조회 중 오류가 발생했습니다.');
  }
}

// 라우터 설정
router.post('/equip', async (req, res) => {
  const { userId, characterId } = req.body;
  try {
    const equippedPlayer = await equipCharacter(userId, characterId);
    res.json(equippedPlayer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/create', async (req, res) => {
  const { userId, characterId } = req.body;
  try {
    const newPlayer = await createPlayer(userId, characterId);
    res.json({
      success: true,
      playerId: newPlayer.playerId,
      message: '플레이어가 성공적으로 생성되었습니다.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/update', async (req, res) => {
  const { playerId, newLevel } = req.body;
  try {
    const updatedPlayer = await updatePlayer(playerId, newLevel);
    res.json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:playerId', async (req, res) => {
  const { playerId } = req.params;
  try {
    const player = await getPlayer(playerId);
    res.json(player);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/equipItem', async (req, res) => {
  const { playerId, itemId } = req.body;
  try {
    const updatedPlayer = await equipItem(playerId, itemId);
    res.json({
      success: true,
      message: '아이템이 성공적으로 장착되었습니다.',
      player: updatedPlayer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
