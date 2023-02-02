import { getAuth } from "firebase/auth";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";
import { firebaseApp } from "../firebase/firebase";
import Image from "next/image";
import { UserContext } from "../provider/UserProvider";
import { useThemeContext } from "../provider/ThemeProvider";
import { MdLightMode, MdDarkMode } from "react-icons/md";

const auth = getAuth(firebaseApp);

const timeOptions: Intl.DateTimeFormatOptions = {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
};

function weekdayNumToStr(weekday: number) {
  switch (weekday) {
    case 0:
      return "Sun";
    case 1:
      return "Mon";
    case 2:
      return "Tues";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    case 6:
      return "Sat";
  }
}

function monthNumToStr(month: number) {
  switch (month) {
    case 0:
      return "Jan";
    case 1:
      return "Feb";
    case 2:
      return "Mar";
    case 3:
      return "Apr";
    case 4:
      return "May";
    case 5:
      return "Jun";
    case 6:
      return "Jul";
    case 7:
      return "Aug";
    case 8:
      return "Sep";
    case 9:
      return "Oct";
    case 10:
      return "Nov";
    case 11:
      return "Dec";
  }
}

function formatAMPM(date: Date) {
  var hours = date.getHours();
  var ampm = hours >= 12 ? "PM" : "AM";

  return ampm;
}

const Header = () => {
  const [weekDay, setWeekDay] = useState(weekdayNumToStr(new Date().getDay()));

  const [date, setDate] = useState(new Date().getDate());
  const [month, setMonth] = useState(monthNumToStr(new Date().getMonth()));
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-US", timeOptions)
  );
  const [dayPeriod, setDayPeriod] = useState(formatAMPM(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setWeekDay(weekdayNumToStr(new Date().getDay()));
      setDate(new Date().getDate());
      setMonth(monthNumToStr(new Date().getMonth()));
      setTime(new Date().toLocaleTimeString("en-US", timeOptions));
      setDayPeriod(formatAMPM(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // useContext
  const { user, setUser } = useContext(UserContext);
  const { theme, setTheme } = useThemeContext();

  // functions
  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    Router.push("/auth");
  };

  return (
    <div className="bg-background2 text-content h-12 justify-between flex content-center px-2 top-0 fixed w-full">
      <div className="flex gap-4 text-content">
        <p className="text-xl font-bold content-center grid">Dezktop</p>
        <div className="flex gap-2">
          <p className="content-center grid">{weekDay}</p>
          <p className="content-center grid">{date}</p>
          <p className="content-center grid">{month}</p>
          <div className="flex gap-1">
            <p className="content-center grid">{time}</p>
            <p className="content-center grid">{dayPeriod}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 align-middle ">
        <div className="content-center grid">
          {theme === "light" ? (
            <MdDarkMode
              size={24}
              className="cursor-pointer"
              onClick={() => {
                setTheme("dark");
              }}
            />
          ) : (
            <MdLightMode
              size={24}
              className="cursor-pointer"
              onClick={() => {
                setTheme("light");
              }}
            />
          )}
        </div>
        <div className="content-center grid">
          <p>{user?.displayName}</p>
        </div>
        <div className="content-center grid">
          <div className="w-8 h-8">
            <Image
              className="rounded-full"
              src={user?.photoURL!!}
              width={32}
              height={32}
              alt={"user photo"}
            />
          </div>
        </div>

        <button
          className="content-center grid hover:text-accent "
          onClick={signOut}
        >
          sign out
        </button>
      </div>
    </div>
  );
};

export default Header;
