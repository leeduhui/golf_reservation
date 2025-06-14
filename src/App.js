// src/App.js
import React, { useState, useEffect } from "react";
import { supabase } from "./utils/supabaseClient";
import TimeTable from "./components/TimeTable";
import ReserveForm from "./components/ReserveForm";

function App() {
  const [reservations, setReservations] = useState([]);
  const [now, setNow] = useState(new Date());

  // 1) 초기 데이터 로드
  useEffect(() => {
    supabase
      .from("reservations")
      .select("*")
      .order("inserted_at", { ascending: true })
      .then(({ data }) => setReservations(data || []));
  }, []);

  // 2) 실시간 리스너 (새 예약이나 취소가 들어올 때마다 반영)
  useEffect(() => {
    const subscription = supabase
      .from("reservations")
      .on("*", payload => {
        // INSERT / DELETE 이벤트에 따라 상태 갱신
        supabase
          .from("reservations")
          .select("*")
          .order("inserted_at", { ascending: true })
          .then(({ data }) => setReservations(data || []));
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  // 3) 현재 시간 초단위 업데이트
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 4) 예약 추가
  const handleReserve = async newRes => {
    await supabase.from("reservations").insert(newRes);
  };

  // 5) 예약 취소
  const handleCancel = async id => {
    await supabase.from("reservations").delete().eq("id", id);
  };

  return (
    <div className="container">
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>스크린골프 예약</h1>
        <div>{now.toLocaleTimeString("ko-KR")}</div>
      </header>
      <TimeTable
        reservations={reservations}
        onCancel={handleCancel}
        currentTime={now}
      />
      <ReserveForm
        reservations={reservations}
        onReserve={handleReserve}
        currentTime={now}
      />
    </div>
  );
}

export default App;

