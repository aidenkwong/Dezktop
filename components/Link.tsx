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
        data-id={name}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
          setMenuPosition({ x: e.clientX, y: e.clientY });

          return false;
        }}
        rel="noreferrer"
        draggable="true"
      >
        <div className="flex w-full h-full" data-id={name}>
          {name}
        </div>
      </a>
      {showMenu && ( // Menu when left click
        <div
          ref={menuRef}
          className="absolute bg-zinc-300 p-2 text-center rounded shadow-lg"
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
