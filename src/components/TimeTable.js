/* src/components/TimeTable.js */
import React from "react";
import "./TimeTable.css";

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
    for (let i = sIdx; i < eIdx; i++) {
      resMap[i] = r;
    }
  });

  const nowTime = new Date(currentTime);
  const isToday = viewedDate === nowTime.toISOString().split("T")[0];
  const nowMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();

  return (
    <div className="timetable">
      {hours.slice(0, -1).map((slot, i) => {
        const r = resMap[i];
        const [sh, sm] = slot.split(":" ).map(Number);
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
                  <button className="cancel" onClick={() => onCancel(r.id)}>취소</button>
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
