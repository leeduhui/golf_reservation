// src/components/TimeTable.js
import React, { useState } from "react";
import "./TimeTable.css";

const hours = Array.from({ length: 39 }, (_, i) => {
  const totalMin = 300 + i * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

function TimeTable({ reservations, onCancel, currentTime, viewedDate }) {
  const now = new Date(currentTime);
  const todayStr = now.toISOString().split("T")[0];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const isBeforeToday = viewedDate < todayStr;
  const isToday = viewedDate === todayStr;

  // 그룹 정보 계산
  const groups = reservations.map(r => {
    const startIndex = hours.indexOf(r.start);
    const endIndex = hours.indexOf(r.end);
    return { ...r, startIndex, endIndex, span: endIndex - startIndex };
  });

  // 모달 상태
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const openCancelModal = grp => {
    setSelectedRes(grp);
    setPasswordInput("");
    setError("");
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
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
          // 이 인덱스가 그룹의 시작인지?
          const grp = groups.find(g => g.startIndex === idx);
          if (grp) {
            // 그룹 단위 렌더링
            const { span, user, id } = grp;
            const groupIsPast =
              isBeforeToday ||
              (isToday &&
                (() => {
                  const [h, m] = slot.split(":").map(Number);
                  return h * 60 + m + (span - 1) * 30 < nowMinutes;
                })());

            return (
              <div
                key={slot}
                className={`reserved-group ${groupIsPast ? "past" : ""}`}
                // flex column / gap 는 CSS에서 처리
              >
                {hours.slice(idx, idx + span).map((innerSlot, j) => {
                  const [h, m] = innerSlot.split(":").map(Number);
                  const slotMin = h * 60 + m;
                  const isPastSlot = groupIsPast || false;
                  return (
                    <div
                      key={innerSlot}
                      className={`time-slot ${isPastSlot ? "past" : ""}`}
                      onClick={() =>
                        j === 0 && !isPastSlot && openCancelModal(grp)
                      }
                    >
                      <div className="slot-time">{innerSlot}</div>
                      <div className="slot-info">
                        {j === 0 ? (
                          <>
                            <span>{user}</span>
                            <button
                              className="cancel"
                              onClick={e => {
                                e.stopPropagation();
                                openCancelModal(grp);
                              }}
                              disabled={isPastSlot}
                            >
                              취소
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // 그룹 내부(시작 이후) 슬롯은 skip
          if (groups.some(g => idx > g.startIndex && idx < g.endIndex)) {
            return null;
          }

          // 예약 없는 슬롯
          const [h, m] = slot.split(":").map(Number);
          const slotMin = h * 60 + m;
          const isPastSlot =
            isBeforeToday || (isToday && slotMin < nowMinutes);

          return (
            <div
              key={slot}
              className={`time-slot ${isPastSlot ? "past" : ""}`}
            >
              <div className="slot-time">{slot}</div>
              <div className="slot-info">
                <span className="available">
                  {isPastSlot ? "지나감" : "예약 가능"}
                </span>
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
