/* src/ReserveForm.js */
import React, { useState, useEffect } from "react";
import { rooms, slots } from "../utils/data";

function ReserveForm({ reservations, onReserve, currentTime }) {
  const [room, setRoom] = useState("1");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  let boundaryMinutes;
  const windowStart = 5 * 60;
  const windowEnd = 24 * 60;
  if (nowMinutes < windowStart) {
    boundaryMinutes = windowStart;
  } else if (nowMinutes >= windowEnd) {
    boundaryMinutes = Infinity;
  } else {
    boundaryMinutes = Math.ceil(nowMinutes / 30) * 30;
  }

  useEffect(() => {
    const available = slots.filter(s => {
      const [h, m] = s.split(":" ).map(Number);
      return h * 60 + m >= boundaryMinutes;
    });
    if (available.length >= 2) {
      setStart(available[0]);
      setEnd(available[1]);
    }
  }, [boundaryMinutes]);

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
    if (!/^\d{4}$/.test(password)) {
      alert("4자리 숫자 비밀번호를 입력해주세요.");
      return;
    }
    onReserve({ id: `${room}-${start}-${end}`, room, start, end, user, password });
    setUser("");
    setPassword("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
      <label style={{ fontWeight: 500, fontSize: "1rem" }}>
        방 번호
        <select value={room} onChange={e => setRoom(e.target.value)} style={{ fontSize: "1.1rem", padding: "10px", minHeight: "44px", width: "100%" }}>
          {rooms.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>

      <label style={{ fontWeight: 500, fontSize: "1rem" }}>
        시작 시간
        <select value={start} onChange={e => setStart(e.target.value)} style={{ fontSize: "1.1rem", padding: "10px", minHeight: "44px", width: "100%" }}>
          {slots.map(s => {
            const [h, m] = s.split(":" ).map(Number);
            const slotMinutes = h * 60 + m;
            const disabled = slotMinutes < boundaryMinutes;
            return <option key={s} value={s} disabled={disabled}>{s}</option>;
          })}
        </select>
      </label>

      <div style={{ width: "100%" }}>
        <label style={{ fontWeight: 500, fontSize: "1rem", display: "block", marginBottom: "6px" }}>
          종료 시간
        </label>
        <select
          value={end}
          onChange={e => setEnd(e.target.value)}
          style={{
            fontSize: "1.1rem",
            padding: "10px",
            minHeight: "44px",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          {slots.map(s => {
            const [h, m] = s.split(":" ).map(Number);
            const slotMinutes = h * 60 + m;
            const startMinutes = start ? parseInt(start.split(":" )[0], 10) * 60 + parseInt(start.split(":" )[1], 10) : 0;
            const disabled = slotMinutes < boundaryMinutes || slotMinutes <= startMinutes;
            return <option key={s} value={s} disabled={disabled}>{s}</option>;
          })}
        </select>
      </div>

      <div style={{ width: "100%", marginTop: "12px" }}>
        <label style={{ fontWeight: 500, fontSize: "1rem", display: "block", marginBottom: "6px" }}>
          이름
        </label>
        <input
          type="text"
          placeholder="이름"
          value={user}
          onChange={e => setUser(e.target.value)}
          required
          style={{
            fontSize: "1.1rem",
            padding: "10px",
            minHeight: "44px",
            width: "100%",
            boxSizing: "border-box"
          }}
        />
      </div>

      <div style={{ width: "100%" }}>
        <label style={{ fontWeight: 500, fontSize: "1rem", display: "block", marginBottom: "6px" }}>
          비밀번호 (4자리 숫자)
        </label>
        <input
          type="password"
          placeholder="****"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          maxLength={4}
          pattern="\d{4}"
          style={{
            fontSize: "1.1rem",
            padding: "10px",
            minHeight: "44px",
            width: "100%",
            boxSizing: "border-box"
          }}
        />
      </div>

      <button type="submit" style={{ backgroundColor: "#007AFF", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontSize: "1.1rem", fontWeight: 600 }}>예약하기</button>
    </form>
  );
}

export default ReserveForm;
