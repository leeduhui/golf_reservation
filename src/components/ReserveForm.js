/* src/components/ReserveForm.js */
import React, { useState, useEffect } from "react";
import { rooms, slots } from "../utils/data";

export default function ReserveForm({ reservations, onReserve, currentTime }) {
  const [room, setRoom] = useState(rooms[0]);
  const [start, setStart] = useState(slots[0]);
  const [end, setEnd] = useState(slots[1]);
  const [user, setUser] = useState("");

  // start 변경 시 end 자동 설정
  useEffect(() => {
    const idx = slots.indexOf(start);
    if (idx < slots.length - 1) setEnd(slots[idx + 1]);
  }, [start]);

  // 현재 시각(분)
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  /* console.log("[DEBUG] nowMinutes:", nowMinutes); */
  const windowStart = 5 * 60;   // 05:00
  const windowEnd = 24 * 60;    // 12:00

  // boundaryMinutes 결정
  let boundaryMinutes;
  if (nowMinutes < windowStart) {
    boundaryMinutes = windowStart;
  } else if (nowMinutes >= windowEnd) {
    boundaryMinutes = Infinity;
  } else {
    boundaryMinutes = Math.ceil(nowMinutes / 30) * 30;
  }
  /* console.log("[DEBUG] boundaryMinutes:", boundaryMinutes); */

  const handleSubmit = e => {
    e.preventDefault();
    /* console.log("[DEBUG] handleSubmit", { room, start, end, user }); */
    const sIdx = slots.indexOf(start);
    const eIdx = slots.indexOf(end);
    if (eIdx <= sIdx) {
      alert("종료 시간은 시작 이후여야 합니다.");
      return;
    }
    const overlap = reservations.some(r =>
      r.room === room &&
      slots.indexOf(r.start) < eIdx &&
      slots.indexOf(r.end) > sIdx
    );
    if (overlap) {
      alert("이미 예약이 있습니다.");
      return;
    }
    onReserve({ id: `${room}-${start}-${end}`, room, start, end, user });
    /* console.log("[DEBUG] Reserved:", { room, start, end, user }); */
    setUser("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
      {/* 방 선택 */}
      <select value={room} onChange={e => setRoom(e.target.value)}>
        {rooms.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {/* 시작시간: boundary 이전 비활성화 */}
      <select value={start} onChange={e => setStart(e.target.value)}>
        {slots.map(s => {
          const [h, m] = s.split(":").map(Number);
          const slotMinutes = h * 60 + m;
          const disabled = slotMinutes < boundaryMinutes;
          /* console.log(`[DEBUG] start slot ${s}: slotMinutes=${slotMinutes}, disabled=${disabled}`); */
          return <option key={s} value={s} disabled={disabled}>{s}</option>;
        })}
      </select>

      {/* 종료시간: boundary 이전 또는 <= start 비활성화 */}
      <select value={end} onChange={e => setEnd(e.target.value)}>
        {slots.map(s => {
          const [h, m] = s.split(":").map(Number);
          const slotMinutes = h * 60 + m;
          const startMinutes = parseInt(start.split(":")[0], 10) * 60 + parseInt(start.split(":")[1], 10);
          const disabled = slotMinutes < boundaryMinutes || slotMinutes <= startMinutes;
          /* console.log(`[DEBUG] end slot ${s}: slotMinutes=${slotMinutes}, startMinutes=${startMinutes}, disabled=${disabled}`); */
          return <option key={s} value={s} disabled={disabled}>{s}</option>;
        })}
      </select>

      {/* 사용자 입력 및 예약 */}
      <input
        type="text"
        placeholder="이름"
        value={user}
        onChange={e => setUser(e.target.value)}
        required
      />
      <button type="submit">예약하기</button>
    </form>
  );
}

