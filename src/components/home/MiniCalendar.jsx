import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isSameMonth } from "date-fns";

export default function MiniCalendar({ loggedDates, selectedDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(new Date());

  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start); // 0=Sun

  const prev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const isLogged = (day) => loggedDates.some((d) => isSameDay(new Date(d), day));
  const isSelected = (day) => selectedDate && isSameDay(new Date(selectedDate), day);

  return null;




































}