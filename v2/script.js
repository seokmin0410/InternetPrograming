// 날짜 문자열 생성 (yyyy-mm-dd 형식)
function getDateString(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
}

// 라벨용 날짜 포맷 (mm/dd)
function getFormattedLabel(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 로컬 스토리지에서 데이터 로드 및 날짜 이동 처리 (날짜 기준 비교)
function loadData() {
  const defaultSchedule = {
    lastAccessDate: getDateString(), // 시각 없이 날짜만 저장
    schedule: {
      today: Array(24).fill(""),
      tomorrow: Array(24).fill(""),
      dayAfterTomorrow: Array(24).fill("")
    }
  };

  let data = JSON.parse(localStorage.getItem("todoData")) || defaultSchedule;

  const lastDateStr = data.lastAccessDate;
  const nowDateStr = getDateString();

  const lastDate = new Date(lastDateStr);
  const nowDate = new Date(nowDateStr);

  const diffDays = Math.floor((nowDate - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays >= 1) {
    if (diffDays === 1) {
      // 하루 지남
      data.schedule.today = data.schedule.tomorrow;
      data.schedule.tomorrow = data.schedule.dayAfterTomorrow;
      data.schedule.dayAfterTomorrow = Array(24).fill("");
    } else {
      // 이틀 이상 지남
      data.schedule.today = Array(24).fill("");
      data.schedule.tomorrow = Array(24).fill("");
      data.schedule.dayAfterTomorrow = Array(24).fill("");
    }

    data.lastAccessDate = nowDateStr;
    localStorage.setItem("todoData", JSON.stringify(data));
  }

  return data;
}

// 데이터 저장
function saveData(data) {
  localStorage.setItem("todoData", JSON.stringify(data));
}

// 화면 생성
function generateSchedule() {
  const header = document.querySelector(".header");
  const body = document.querySelector(".body");
  header.innerHTML = "";
  body.innerHTML = "";

  const data = loadData();
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  // 헤더 구성
  const timeHeader = document.createElement("div");
  timeHeader.className = "cell";
  timeHeader.textContent = "시간";
  header.appendChild(timeHeader);

  ["오늘", "내일", "모레"].forEach((label, i) => {
    const dateStr = getFormattedLabel(i);
    const dayCell = document.createElement("div");
    dayCell.className = "cell";
    dayCell.textContent = `${label} (${dateStr})`;
    header.appendChild(dayCell);
  });

  const keys = ["today", "tomorrow", "dayAfterTomorrow"];

  for (let hour = 0; hour < 24; hour++) {
    const row = document.createElement("div");
    row.className = "row";

    const timeCell = document.createElement("div");
    timeCell.className = "cell time-cell";
    timeCell.textContent = `${String(hour).padStart(2, "0")}:00 ~ ${String((hour + 1) % 24).padStart(2, "0")}:00`;
    row.appendChild(timeCell);

    keys.forEach((key, index) => {
      const inputWrapper = document.createElement("div");
      inputWrapper.className = "cell input-cell";

      const input = document.createElement("input");
      input.type = "text";
      input.value = data.schedule[key][hour] || "";

      const endHourMinutes = (hour + 1) * 60;
      if (key === "today" && currentTotalMinutes >= endHourMinutes) {
        inputWrapper.classList.add("past-cell");
        input.disabled = true;
      }

      input.addEventListener("input", () => {
        data.schedule[key][hour] = input.value;
        saveData(data);
      });

      input.addEventListener("dblclick", () => {
        const data = loadData();
        selectedKey = key;
        selectedHour = hour;
        selectedInputElement = input;

        const panel = document.getElementById("input-panel");
        document.getElementById("panel-info").textContent = `시간대: ${key} ${hour}:00 ~ ${(hour + 1) % 24}:00`;
        document.getElementById("panel-input").value = data.schedule[key][hour] || "";
        panel.style.display = "block";
      });

      inputWrapper.appendChild(input);
      row.appendChild(inputWrapper);
    });

    body.appendChild(row);
  }
}

// 입력 패널 관련 변수
let selectedKey = null;
let selectedHour = null;
let selectedInputElement = null;

// 패널 저장 버튼
document.getElementById("panel-save").addEventListener("click", () => {
  const text = document.getElementById("panel-input").value;
  const data = loadData();

  data.schedule[selectedKey][selectedHour] = text;
  saveData(data);
  selectedInputElement.value = text;

  document.getElementById("input-panel").style.display = "none";
});

// 패널 취소 버튼
//document.getElementById("panel-cancel").addEventListener("click", () => {
  //document.getElementById("input-panel").style.display = "none";
//});

// 페이지 로드시 처리
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  generateSchedule();
});



const panel = document.getElementById("input-panel");

let isDragging = false;
let offsetX, offsetY;

panel.style.position = "absolute";

panel.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - panel.getBoundingClientRect().left;
  offsetY = e.clientY - panel.getBoundingClientRect().top;
  panel.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    panel.style.left = `${e.clientX - offsetX}px`;
    panel.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  panel.style.cursor = "default";
});

document.getElementById("panel-close").addEventListener("click", () => {
  document.getElementById("input-panel").style.display = "none";
});

