let selectedDate = "";

// 오늘 날짜 구하기
function getToday() {
  const today = new Date();
  return formatDate(today);
}

// 날짜 객체를 "YYYY/MM/DD" 형식으로 변환
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

// 작성 팝업 열기
function openDiary(date) {
  selectedDate = date;
  document.getElementById("diaryDateLabel").innerText = `날짜: ${date}`;
  document.getElementById("diaryContent").value = localStorage.getItem(`diary-${date}`) || "";
  document.getElementById("diaryPopup").style.display = "block";
}

// 팝업 닫기
function closePopup() {
  document.getElementById("diaryPopup").style.display = "none";
  document.getElementById("diaryContent").value = "";
}

// 저장 시 해당 셀에 내용 표시
function saveDiary() {
  const content = document.getElementById("diaryContent").value;

  // localStorage에 저장
  localStorage.setItem(`diary-${selectedDate}`, content);

  // 최대 30자까지만 표시 + ... 추가
  const preview = content.length > 30 ? content.substring(0, 30) + "..." : content;

  // 화면에 표시 (미리보기 + 버튼 유지)
  const rows = document.getElementById("diaryTable").rows;
  for (let row of rows) {
    if (row.cells[0].innerText === selectedDate) {
      row.cells[1].innerHTML = `
        <div class="diary-entry">${preview}</div>
        <button onclick="openDiary('${selectedDate}')">작성하기</button>
      `;
      break;
    }
  }

  closePopup();
}

//하루 지날 때마다 행 새로 생성성
function initializeTable() {
  const table = document.getElementById("diaryTable");
  let today = stripTime(new Date());
  let startDate = new Date("2025-04-01");

  while (startDate <= today) {
    addRow(formatDate(startDate), true); // 최신 날짜가 위에 오도록
    startDate.setDate(startDate.getDate() + 1);
  }
}

// 날짜 객체에서 시간 제거
function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


// 행 추가 함수
function addRow(dateStr, toTop = true) {
  const table = document.getElementById("diaryTable");
  const newRow = table.insertRow(toTop ? 0 : table.rows.length);
  const dateCell = newRow.insertCell(0);
  const btnCell = newRow.insertCell(1);

  dateCell.innerText = dateStr;
  btnCell.innerHTML = `<button onclick="openDiary('${dateStr}')">작성하기</button>`;
}

// 하루 지나면 자동으로 새 날짜 행 추가
let lastAddedDate = getToday();

setInterval(() => {
  const now = getToday();
  if (now !== lastAddedDate) {
    addRow(now, true); // 새로운 날짜 행 추가
    lastAddedDate = now;
  }
}, 3600000); // 1시간마다 검사
// 테스트 목적으로 시간을 줄이고 싶다면 10000 (10초)로 설정 가능

/*
//무한 스크롤
let currentOldestDate = stripTime(new Date()); // 오늘부터 시작

function loadMorePastDates(days = 7) {
  for (let i = 1; i <= days; i++) {
    currentOldestDate.setDate(currentOldestDate.getDate() - 1);
    addRow(formatDate(currentOldestDate), false); // 아래로 추가
  }
}

// 스크롤 이벤트 감지
window.addEventListener('scroll', () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    loadMorePastDates();
  }
});
*/

initializeTable();