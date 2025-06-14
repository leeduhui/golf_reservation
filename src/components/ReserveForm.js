/* src/components/ReserveForm.js */
import React, { useState, useEffect } from "react";
import { rooms, slots } from "../utils/data";

export default function ReserveForm({ reservations, onReserve, currentTime }) {
  const [room, setRoom] = useState(rooms[0]);
  const [start, setStart] = useState(slots[0]);
  const [end, setEnd] = useState(slots[1]);
  const [user, setUser] = useState("");

  useEffect(() => {
    const idx = slots.indexOf(start);
    if (idx < slots.length - 1) setEnd(slots[idx + 1]);
  }, [start]);

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const handleSubmit = e => {
    e.preventDefault();
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
    setUser("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
      <select value={room} onChange={e => setRoom(e.target.value)}>
        {rooms.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <select value={start} onChange={e => setStart(e.target.value)}>
        {slots.map(s => {
          const [h, m] = s.split(":").map(Number);
          const slotMinutes = h * 60 + m;
          return (
            <option
              key={s}
              value={s}
              disabled={slotMinutes <= nowMinutes}
            >
              {s}
            </option>
          );
        })}
      </select>
      <select value={end} onChange={e => setEnd(e.target.value)}>
        {slots.map(s => {
          const [h, m] = s.split(":").map(Number);
          const slotMinutes = h * 60 + m;
          const startMinutes = slots.indexOf(start) * 30 + 5 * 60;
          return (
            <option
              key={s}
              value={s}
              disabled={
                slotMinutes <= nowMinutes ||
                slotMinutes <= (slots.indexOf(start) * 30 + 5 * 60)
              }
            >
              {s}
            </option>
          );
        })}
      </select>
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

