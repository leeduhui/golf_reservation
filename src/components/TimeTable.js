/* src/components/TimeTable.js */
import React from "react";
import "./TimeTable.css";

// 05:00 ~ 24:00 까지 30분 단위, "24:00" 포함
const hours = Array.from({ length: 39 }, (_, i) => {
  const h = Math.floor((300 + i * 30) / 60);
  const m = (300 + i * 30) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

function TimeTable({ reservations, onCancel, currentTime, viewedDate }) {
  const resMap = {};
  reservations.forEach(r => {
    const sIdx = hours.indexOf(r.start);
    const eIdx = hours.indexOf(r.end);
    if (sIdx !== -1 && eIdx !== -1) {
      for (let i = sIdx; i < eIdx; i++) {
        resMap[i] = r;
      }
    }
  });

  const nowTime = new Date(currentTime);
  const isToday = viewedDate === nowTime.toISOString().split("T")[0];
  const nowMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();

  const handleCancelClick = (reservation) => {
    const inputContainer = document.createElement("div");
    const input = document.createElement("input");
    input.type = "password";
    input.placeholder = "비밀번호 4자리";
    input.style.padding = "8px";
    input.style.width = "100%";
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "확인";
    confirmBtn.style.marginTop = "8px";
    confirmBtn.onclick = () => {
      if (input.value === reservation.password) {
        document.body.removeChild(inputContainer);
        onCancel(reservation.id);
      } else {
        alert("비밀번호가 일치하지 않습니다. 취소할 수 없습니다.");
        document.body.removeChild(inputContainer);
      }
    };
    inputContainer.style.position = "fixed";
    inputContainer.style.top = "50%";
    inputContainer.style.left = "50%";
    inputContainer.style.transform = "translate(-50%, -50%)";
    inputContainer.style.background = "white";
    inputContainer.style.padding = "20px";
    inputContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    inputContainer.style.zIndex = 1000;
    inputContainer.appendChild(input);
    inputContainer.appendChild(confirmBtn);
    document.body.appendChild(inputContainer);
  };

  return (
    <div className="timetable">
      {hours.map((slot, i) => {
        const r = resMap[i];
        const [sh, sm] = slot.split(":").map(Number);
        const slotMinutes = sh * 60 + sm;
        const isPast = isToday && slotMinutes < nowMinutes;
        const rowClass = `time-slot ${r ? "reserved" : ""}`;

        return (
          <div key={slot} className={rowClass} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f7f7f7' }}>
            <div className="slot-time">{slot}</div>
            <div className="slot-info">
              {r ? (
                <>
                  <span>{r.user}</span>
                  <button className="cancel" onClick={() => handleCancelClick(r)}>취소</button>
                </>
              ) : (
                <span className="available">예약 가능</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TimeTable;
