export function formatDateKorean(value: string) {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }

  return `${year}년 ${month}월 ${day}일`;
}

export function formatDotDate(value: string) {
  return value.replace(/-/g, '.');
}
