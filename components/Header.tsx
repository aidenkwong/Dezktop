import { getAuth } from "firebase/auth";
import Router from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { firebaseApp } from "../firebase/firebase";
import Image from "next/image";
import { UserContext } from "../provider/UserProvider";
import { useThemeContext } from "../provider/ThemeProvider";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useAutocomplete } from "@mui/material";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { firebaseDB } from "../firebase/firebase";

import { formatAMPM, monthNumToStr, weekdayNumToStr } from "../helper/helper";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useOutside from "../helper/hooks/useOutside";

import Location from "../types/location.type";
import TemperatureDegree from "./header/TemperatureDegree";
import Tooltip from "./utils/Tooltip";

const auth = getAuth(firebaseApp);

const timeOptions: Intl.DateTimeFormatOptions = {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
};

const Header = () => {
  // Supabase client hook
  const supabase = useSupabaseClient();

  // useContext
  const { user, setUser } = useContext(UserContext);
  const { theme, setTheme } = useThemeContext();

  // useState
  const [weekDay, setWeekDay] = useState(weekdayNumToStr(new Date().getDay()));
  const [date, setDate] = useState(new Date().getDate());
  const [month, setMonth] = useState(monthNumToStr(new Date().getMonth()));
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-US", timeOptions)
  );
  const [dayPeriod, setDayPeriod] = useState(formatAMPM(new Date()));
  const [options, setOptions] = useState<Array<Location>>([]);
  const [location, setLocation] = useState<Location | null>(
    JSON.parse(localStorage.getItem("location")!!) || null
  );
  const [showChangeLocation, setShowChangeLocation] = useState(!location);

  // useRef
  const changeLocationInputRef = useRef<HTMLInputElement>(null);

  // Hook for auto-complete component
  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    id: "location",
    options,
    getOptionLabel: (option) => `${option.city}, ${option.country}`,
    onChange: async (_event, value) => {
      if (value) {
        setShowChangeLocation(false);
        setLocation(value);
        try {
          localStorage.setItem("location", JSON.stringify(value));
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
          city: item.city,
          country: item.country,
          lat: item.lat,
          lng: item.lng,
        })) || []
      );
    },
  });

  // Component did mount
  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setWeekDay(weekdayNumToStr(new Date().getDay()));
      setDate(new Date().getDate());
      setMonth(monthNumToStr(new Date().getMonth()));
      setTime(new Date().toLocaleTimeString("en-US", timeOptions));
      setDayPeriod(formatAMPM(new Date()));
    }, 1000);

    // Get user location
    (async () => {
      try {
        const docRef = doc(firebaseDB, "user_info", user?.uid!!);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();

        if (data?.location) {
          setLocation(data.location);
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

  useEffect(() => {
    if (location) {
      localStorage.setItem("location", JSON.stringify(location));
    } else {
      localStorage.removeItem("location");
      setShowChangeLocation(true);
    }
  }, [location]);

  // Click outside hook
  useOutside(changeLocationInputRef, () => {
    if (location) {
      setShowChangeLocation(false);
    } else {
      setShowChangeLocation(true);
    }
  });

  // functions
  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    Router.push("/auth");
  };

  return (
    <div className="bg-background2 text-content h-12 justify-between flex content-center px-2 top-0 fixed w-full">
      <div className="flex gap-4 text-content">
        <div className="text-xl font-bold content-center grid">Dezktop</div>
        <div className="flex gap-2 w-40">
          <div className="content-center grid">{weekDay}</div>
          <div className="content-center grid">{date}</div>
          <div className="content-center grid">{month}</div>
          <div className="flex gap-1">
            <div className="content-center grid">{time}</div>
            <div className="content-center grid">{dayPeriod}</div>
          </div>
        </div>
        {location && <TemperatureDegree location={location} />}
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
              {groupedOptions.length > 0 && (
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
                      {option.city}, {option.country}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="content-center grid cursor-pointer">
            <Tooltip title="change location">
              <div onClick={() => setShowChangeLocation(true)}>
                {location?.city}
              </div>
            </Tooltip>
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
          <p>{user?.displayName || user?.email}</p>
        </div>
        <div className="content-center grid">
          <div className="w-8 h-8">
            <Image
              className="rounded-full"
              src={user?.photoURL || "/assets/user.jpeg"}
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
