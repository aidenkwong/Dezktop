import { useEffect, useRef, useState } from "react";

const Link = ({ name, url, deleteLink }: any) => {
  // useState
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

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
    <>
      <a
        target="_blank"
        href={url}
        key={name}
        className="border-zinc-700 border-2 h-32 justify-between p-1 text-black"
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
          setMenuPosition({ x: e.clientX, y: e.clientY });

          return false;
        }}
        rel="noreferrer"
      >
        <div>{name}</div>
      </a>
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute bg-gray-200 p-2 "
          style={{
            left: menuPosition.x + window.scrollX,
            top: menuPosition.y + window.scrollY,
            display: "block",
          }}
        >
          <button onClick={() => deleteLink(name)}>Delete Link</button>
        </div>
      )}
    </>
  );
};

export default Link;
