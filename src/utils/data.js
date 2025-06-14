/* src/utils/data.js */
export const rooms = ["1번 방"];
export const slots = Array.from({ length: (12 - 5) * 2 + 1 }, (_, i) => {
  const hour = 5 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  // 올바른 분 표시를 위해 `${minute}` 사용
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

