/* src/components/TimeTable.js */
import React, { useState } from "react";
import "./TimeTable.css";

// 05:00 ~ 24:00 30분 단위, "24:00" 포함
const hours = Array.from({ length: 39 }, (_, i) => {
  const totalMin = 300 + i * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

function TimeTable({ reservations, onCancel, currentTime, viewedDate }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  // 예약을 인덱스별로 매핑
  const resMap = {};
  reservations.forEach(r => {
    const sIdx = hours.indexOf(r.start);
    const eIdx = hours.indexOf(r.end);
    for (let i = sIdx; i < eIdx; i++) resMap[i] = r;
  });

  // 현재 시간, 오늘 여부, 분 단위 계산
  const now = new Date(currentTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = viewedDate === now.toISOString().split("T")[0];

  // 모달 열기
  const openCancelModal = reservation => {
    setSelectedRes(reservation);
    setPasswordInput("");
    setError("");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedRes(null);
    setError("");
  };

  // 모달 확인
  const confirmCancel = () => {
    if (passwordInput === selectedRes.password) {
      onCancel(selectedRes.id);
      closeModal();
    } else {
      setError("비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <>
      <div className="timetable">
        {hours.map((slot, idx) => {
          const r = resMap[idx];
          const [h, m] = slot.split(":").map(Number);
          const slotMin = h * 60 + m;
          const isPast = isToday && slotMin < nowMinutes;

          return (
            <div
              key={slot}
              className={`time-slot ${r ? "reserved" : ""} ${isPast ? "past" : ""}`}
              onClick={() => r && !isPast && openCancelModal(r)}
            >
              <div className="slot-time">{slot}</div>
              <div className="slot-info">
                {r ? (
                  <>
                    <span>{r.user}</span>
                    <button
                      className="cancel"
                      onClick={e => { e.stopPropagation(); openCancelModal(r); }}
                      disabled={isPast}
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <span className="available">예약 가능</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="cancel-modal">
            <h3>예약 취소</h3>
            <p>{selectedRes.user} 님의 예약을 취소하려면 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="4자리 비밀번호"
            />
            {error && <div className="error">{error}</div>}
            <div className="modal-buttons">
              <button onClick={confirmCancel}>확인</button>
              <button onClick={closeModal}>취소</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TimeTable;
