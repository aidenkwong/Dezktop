import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../provider/ThemeProvider";

const Link = ({
  name,
  url,
  type,
  deleteLink,
  setDirectory,
  loading,
  linksRef,
  index,
  directory,
}: any) => {
  // useState
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // useContext
  const { theme } = useContext(ThemeContext);

  // useRef
  const menuRef = useRef(null);

  // hooks
  const useOutside = (ref: any) => {
    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowMenu(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  useOutside(menuRef);

  return (
    <div
      ref={(el: any) => (linksRef.current[index] = el)}
      className={`h-32 w-full justify-between p-1 text-black rounded cursor-pointer hover:bg-${theme}-200 ${
        type === "url"
          ? `bg-${theme}-300`
          : `folder bg-${theme}-300 border-2 border-${theme}-900 transition-transform ease-in-out duration-300`
      }`}
      onClick={() => {
        if (type === "folder") {
          setDirectory((prev: string) => prev + "/" + name);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(true);
        setMenuPosition({ x: e.clientX, y: e.clientY });

        return false;
      }}
      draggable={type === "url" && loading === false}
      data-key={directory + "/" + name}
    >
      <a target="_blank" href={url} key={name} rel="noreferrer">
        <div>{name}</div>
      </a>
      {showMenu && ( // Menu when left click
        <div
          ref={menuRef}
          className={`absolute bg-${theme}-300 p-2 text-center rounded shadow-lg`}
          style={{
            left: menuPosition.x + window.scrollX,
            top: menuPosition.y + window.scrollY,
            display: "block",
          }}
        >
          <button onClick={() => deleteLink(name)}>Delete Link</button>
        </div>
      )}
    </div>
  );
};

export default Link;
