// DOMContentLoaded 이벤트가 발생할 때 실행되는 함수
document.addEventListener('DOMContentLoaded', function() {
    loadMessages();  // 서버에서 메시지 불러오기
    document.getElementById('send').addEventListener('click', sendMessage);  // 'send' 버튼 클릭 시 sendMessage 함수 호출
});

// 메시지를 서버로 보내는 비동기 함수
async function sendMessage() {
    const NameInput = localStorage.getItem('input-name');
    const chatInput = document.getElementById('chat-input').value.trim();  // 'chat-input' 입력 필드의 값을 가져옴
    const pageId = parseInt(document.getElementById('send').dataset.pageId, 10);  // 'send' 버튼의 데이터 속성에서 페이지 ID 가져옴
    if (NameInput && chatInput) {  // 이름과 메시지가 유효한 경우
        try {
            console.log('메시지 전송 중:', { name: NameInput, message: chatInput, pageId: pageId });
            // 서버에 메시지를 제출하기 위한 요청
            const response = await fetch('../api/submit_message.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `name=${encodeURIComponent(NameInput)}&message=${encodeURIComponent(chatInput)}&page_id=${encodeURIComponent(pageId)}`
            });
            const responseText = await response.text();  // 응답을 텍스트 형식으로 먼저 파싱
            console.log('서버 응답 텍스트:', responseText);
            const data = JSON.parse(responseText);  // 텍스트를 JSON으로 파싱
            console.log('서버 응답 JSON:', data);
            if (data.success) {
                console.log(data.message);  // 성공 메시지 출력
                loadMessages();  // 메시지 목록 새로고침
            } else {
                console.error(data.message);  // 오류 메시지 출력
            }
            document.getElementById('chat-input').value = '';  // 입력 필드 초기화
        } catch (error) {
            console.error("메시지 전송 중 오류 발생:", error);  // 요청 중 오류 발생 시 메시지 출력
        }
    } else {
        console.log('메시지를 입력해 주세요.');  // 유효하지 않은 메시지일 경우 메시지 출력
    }
}

// 서버에서 메시지를 불러오는 비동기 함수
async function loadMessages() {
    const chatWrap = document.getElementById('chat_wrap');  // 'chat_wrap' 요소 가져오기
    const pageId = parseInt(document.getElementById('send').dataset.pageId, 10);  // 'send' 버튼의 데이터 속성에서 페이지 ID 가져옴
    try {
        const response = await fetch('../api/load_message.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'  // POST 요청에 필요한 헤더 설정
            },
            body: `page_id=${encodeURIComponent(pageId)}`  // POST 요청 본문 설정
        });
        const data = await response.json();  // 응답을 JSON 형식으로 파싱
        console.log('서버 응답:', data);
        if (data.success) {
            const messages = data.messages;  // 메시지 목록 가져오기

            chatWrap.innerHTML = '';  // 'chat_wrap' 요소 초기화

            messages.forEach((messageData, index) => {
                const messageElement = document.createElement('div');  // 메시지 요소 생성
                const fromElement = document.createElement('p');  // 송신자 요소 생성
                const textElement = document.createElement('p');  // 메시지 텍스트 요소 생성

                fromElement.textContent = "from. " + messageData.name;  // 송신자 이름 설정
                fromElement.className = 'from';  // 송신자 클래스 설정

                textElement.innerHTML = messageData.message.replace(/\n/g, '<br>');  // 메시지 텍스트 설정 및 줄바꿈 처리
                textElement.className = 'text';  // 메시지 텍스트 클래스 설정

                const messageClass = index % 2 === 0 ? 'chat red' : 'chat blue';  // 메시지 색상 클래스 설정
                messageElement.className = messageClass;  // 메시지 요소 클래스 설정

                messageElement.appendChild(textElement);  // 메시지 요소에 텍스트 요소 추가
                messageElement.appendChild(fromElement);  // 메시지 요소에 송신자 요소 추가

                chatWrap.appendChild(messageElement);  // 'chat_wrap' 요소에 메시지 요소 추가
            });
            chatWrap.scrollTop = chatWrap.scrollHeight;  // 스크롤을 맨 아래로 이동
        } else {
            console.error(data.message);  // 오류 메시지 출력
        }
    } catch (error) {
        console.error("메시지 불러오는 중 오류 발생:", error);  // 요청 중 오류 발생 시 메시지 출력
    }
}
