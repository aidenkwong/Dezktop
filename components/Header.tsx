import { getAuth } from "firebase/auth";
import Router from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { firebaseApp } from "../firebase/firebase";
import Image from "next/image";
import { UserContext } from "../provider/UserProvider";
import { useThemeContext } from "../provider/ThemeProvider";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { useAutocomplete } from "@mui/base/AutocompleteUnstyled";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { firebaseDB } from "../firebase/firebase";
import CircularProgress from "@mui/material/CircularProgress";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_KEY as string
);
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
  // useContext
  const { user, setUser } = useContext(UserContext);
  const { theme, setTheme } = useThemeContext();

  const [weekDay, setWeekDay] = useState(weekdayNumToStr(new Date().getDay()));

  const [date, setDate] = useState(new Date().getDate());
  const [month, setMonth] = useState(monthNumToStr(new Date().getMonth()));
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-US", timeOptions)
  );
  const [dayPeriod, setDayPeriod] = useState(formatAMPM(new Date()));
  const [temperature, setTemperature] = useState(null);
  const [options, setOptions] = useState<
    Array<{
      label: string;
      city: string;
      country: string;
      lat: number;
      lng: number;
    }>
  >([]);
  const [showChangeLocation, setShowChangeLocation] = useState(true);
  const [location, setLocation] = useState<string>();
  const [temperatureLoading, setTemperatureLoading] = useState(false);

  const changeLocationInputRef = useRef<HTMLInputElement>(null);

  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    id: "use-autocomplete-demo",
    options,
    isOptionEqualToValue: () => true,
    getOptionLabel: (option) => option.label,
    onChange: async (_event, value) => {
      if (value) {
        setShowChangeLocation(false);
        updateTemperature({ lat: value.lat, lng: value.lng });
        setLocation(value.city);
        try {
          await updateDoc(doc(firebaseDB, "user_info", user?.uid!!), {
            location: {
              city: value.city,
              country: value.country,
              lat: value.lat,
              lng: value.lng,
            },
          });
        } catch (error: any) {
          if (error.code === "not-found") {
            await setDoc(doc(firebaseDB, "user_info", user?.uid!!), {
              location: {
                city: value.city,
                country: value.country,
                lat: value.lat,
                lng: value.lng,
              },
            });
          }
          console.error(error);
        }
      } else {
        setShowChangeLocation(true);
      }
    },
    onInputChange: async (e: any) => {
      const { data } = await supabase
        .from("cities")
        .select("city, country, lat, lng")
        .ilike("city", `${e.target.value}%`)
        .limit(5);

      setOptions(
        data?.map((item: any) => ({
          label: `${item.city}, ${item.country}`,
          city: item.city,
          country: item.country,
          lat: item.lat,
          lng: item.lng,
        })) || []
      );
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setWeekDay(weekdayNumToStr(new Date().getDay()));
      setDate(new Date().getDate());
      setMonth(monthNumToStr(new Date().getMonth()));
      setTime(new Date().toLocaleTimeString("en-US", timeOptions));
      setDayPeriod(formatAMPM(new Date()));
    }, 1000);

    (async () => {
      try {
        const docRef = doc(firebaseDB, "user_info", user?.uid!!);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();

        if (data?.location) {
          const { lat, lng, city } = data.location;

          updateTemperature({ lat, lng });
          setLocation(city);
          setShowChangeLocation(false);
        } else {
          setShowChangeLocation(true);
        }
      } catch (error) {
        console.error(error);
        setShowChangeLocation(true);
      }
    })();

    return () => clearInterval(interval);
  }, [user?.uid]);

  const updateTemperature = async ({
    lat,
    lng,
  }: {
    lat: number;
    lng: number;
  }) => {
    try {
      setTemperatureLoading(true);

      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=a824fa87d701dca1e473519f17f09036`
      );

      setTemperatureLoading(false);
      setTemperature(data.main.temp);
    } catch (error) {
      console.log(error);
    }
  };

  const useOutside = (ref: any) => {
    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (ref.current && !ref.current.contains(event.target)) {
          if (temperature && location) {
            setShowChangeLocation(false);
          } else {
            setShowChangeLocation(true);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  useOutside(changeLocationInputRef);

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
        <div className="flex gap-2 w-40">
          <p className="content-center grid">{weekDay}</p>
          <p className="content-center grid">{date}</p>
          <p className="content-center grid">{month}</p>
          <div className="flex gap-1">
            <p className="content-center grid">{time}</p>
            <p className="content-center grid">{dayPeriod}</p>
          </div>
        </div>
        {temperature && !temperatureLoading && (
          <p className="content-center grid">{temperature}°C</p>
        )}
        {temperatureLoading && (
          <div className="content-center grid">
            <CircularProgress size={20} color="inherit" thickness={6} />
          </div>
        )}

        {showChangeLocation ? (
          <div className="content-center grid" ref={changeLocationInputRef}>
            <div className="relative">
              <div {...getRootProps()}>
                <input
                  {...getInputProps()}
                  className="h-8 p-2 bg-background focus:outline-none w-44 rounded-md"
                  placeholder="location"
                  autoFocus={true}
                />
              </div>
              {groupedOptions.length > 0 ? (
                <ul
                  {...getListboxProps()}
                  className="h-8 rounded-md absolute -bottom-8 left-0 z-50"
                >
                  {groupedOptions.map((option: any, index: any) => (
                    <li
                      {...getOptionProps({ option, index })}
                      className="w-44 p-2 bg-background focus:bg-background2 hover:bg-background2 cursor-pointer"
                      key={index}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            className="content-center grid cursor-pointer"
            onClick={() => setShowChangeLocation(true)}
          >
            {location}
          </div>
        )}
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
