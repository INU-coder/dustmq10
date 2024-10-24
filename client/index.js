document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const characterSection = document.getElementById('characterManagement');
  const characterDisplay = document.getElementById('characterDisplay');
  const equipCharacterButton = document.getElementById('equipCharacter');
  const equipItemButton = document.getElementById('equipItem');

  let accessToken = null;

  // 회원가입 이벤트
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const name = document.getElementById('signupName').value;
    const password = document.getElementById('signupPassword').value;

    const response = await fetch('http://localhost:8080/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: email, name, password }),
    });

    const data = await response.json();
    alert(data.message);
  });

  // 로그인 이벤트
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: email, password }),
    });

    const data = await response.json();

    if (data.success) {
      accessToken = data.accessToken;
      alert(data.message);
      characterSection.classList.remove('hidden');
      characterDisplay.classList.remove('hidden');
    } else {
      alert(data.message);
    }
  });

  // 캐릭터 장착 이벤트
  equipCharacterButton.addEventListener('click', async () => {
    const characterId = document.getElementById('characterSelect').value;

    const response = await fetch('http://localhost:8080/player/equip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId: 1, characterId }), // userId는 실제 로그인한 유저로 대체
    });

    const data = await response.json();

    if (data.success) {
      alert('캐릭터 장착 성공');
      updateCharacterImage(data.characterName); // 캐릭터 이름을 기반으로 이미지 업데이트
    } else {
      alert('캐릭터 장착 실패');
    }
  });

  // 캐릭터 이름에 따른 이미지 업데이트 함수
  function updateCharacterImage(characterName) {
    const imagePathMap = {
      Archer: './png/Archer.PNG',
      Defender: './png/Defender.PNG',
      Healer: './png/Healer.PNG',
      Slayer: './png/Slayer.PNG',
    };

    const characterImage = document.getElementById('characterImage');
    characterImage.src = imagePathMap[characterName] || './png/default.png'; // 캐릭터 이미지 경로 설정
  }

  // 아이템 장착 이벤트
  equipItemButton.addEventListener('click', async () => {
    const itemId = document.getElementById('itemSelect').value;

    const response = await fetch('http://localhost:8080/player/equipItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ playerId: 1, itemId }), // playerId는 실제 로그인한 플레이어로 대체
    });

    const data = await response.json();
    alert(data.success ? '아이템 장착 성공' : '아이템 장착 실패');
  });
});
