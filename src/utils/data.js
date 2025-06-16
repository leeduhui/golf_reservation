/* src/utils/data.js */
export const rooms = ["1번 방"];


// 05:00 ~ 24:00까지 30분 단위 슬롯 생성
export const slots = Array.from({ length: 39 }, (_, i) => {
  const minutes = 300 + i * 30; // 300분 = 5시간 = 05:00 시작
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});