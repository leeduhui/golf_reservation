/* src/App.js */
import React, { useState, useEffect } from "react";
import { supabase } from "./utils/supabaseClient";
import TimeTable from "./components/TimeTable";
import ReserveForm from "./components/ReserveForm";
import "./App.css";

function App() {
  const [reservations, setReservations] = useState([]);
  const [now, setNow] = useState(new Date());
  const [currentDateOffset, setCurrentDateOffset] = useState(0);
  // ⬇️ 토스트 메시지 상태 추가
  const [toastMessage, setToastMessage] = useState(null);

  const today = new Date();
  const viewedDate = new Date(today);
  viewedDate.setDate(today.getDate() + currentDateOffset);
  const viewedDateString = viewedDate.toISOString().split("T")[0];

  useEffect(() => {
    fetchReservations();
    const channel = supabase
      .channel("public:reservations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => fetchReservations()
      )
      .subscribe();

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => {
      channel.unsubscribe();
      clearInterval(timer);
    };
  }, [currentDateOffset]);

  async function fetchReservations() {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("date", viewedDateString);
    if (!error) setReservations(data);
  }

  const handleReserve = async newRes => {
    const { error } = await supabase.from("reservations").insert({
      room: newRes.room,
      start: newRes.start,
      end: newRes.end,
      user: newRes.user,
      password: newRes.password,
      date: viewedDateString
    });
    if (error) {
      console.error("[Supabase Error] 예약 실패:", error.message);
      alert("예약 중 오류가 발생했습니다: " + error.message);
    } else {
      await fetchReservations();
      // ⬇️ 예약 성공 시 토스트 표시
      setToastMessage("예약이 완료되었습니다!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleCancel = async id => {
    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("[Supabase Error] 예약 취소 실패:", error.message);
    } else {
      await fetchReservations();
      setToastMessage("취소 되었습니다!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDateChange = offset => {
    setCurrentDateOffset(offset);
  };

  const filteredReservations = reservations.filter(
    r => r.date === viewedDateString
  );

  return (
    <div className="container" style={{ maxWidth: "480px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontWeight: 600, fontSize: "1.25rem", margin: 0 }}>
          예약 페이지
        </h2>
        <p>
          {viewedDateString} {now.toLocaleTimeString()}
        </p>
      </header>

      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
        {[-3, -2, -1, 0, 1, 2, 3].map(offset => {
          const d = new Date(today);
          d.setDate(today.getDate() + offset);
          const label = d.toLocaleDateString("ko-KR", {
            month: "2-digit",
            day: "2-digit",
            weekday: "short"
          });
          const isActive = offset === currentDateOffset;
          return (
            <button
              key={offset}
              onClick={() => handleDateChange(offset)}
              style={{
                padding: "6px 12px",
                borderRadius: "12px",
                border: "none",
                fontSize: "0.85rem",
                backgroundColor: isActive ? "#007AFF" : "#F0F0F5",
                color: isActive ? "white" : "#333",
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                transition: "background-color 0.2s ease"
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "12px" }}>
          예약 현황
        </h3>
        <TimeTable
          reservations={filteredReservations}
          onCancel={handleCancel}
          currentTime={now}
          viewedDate={viewedDateString}
        />
      </div>

      <div style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: "1.1rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "12px" }}>
          새 예약 추가
        </h3>
        <div style={{ marginBottom: "12px" }}>
          <ReserveForm
            reservations={filteredReservations}
            onReserve={handleReserve}
            currentTime={now}
            viewedDate={viewedDateString}
            style={{ fontSize: "1.1rem", padding: "10px", minHeight: "50px" }}
          />
        </div>
      </div>

      {/* ⬇️ Toast Modal */}
      {toastMessage && (
        <div className="toast-modal">
          <div className="toast-content">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}

export default App;
