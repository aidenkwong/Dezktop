import { useEffect, useRef, useState } from "react";

const Link = ({
  name,
  url,
  type,
  deleteLink,
  directory,
  setDirectory,
  linksRef,
  loading,
  index,
}: any) => {
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
        data-key={directory + "/" + name}
        ref={(el) => (linksRef.current[index] = el)}
        onClick={() => {
          if (type === "folder") {
            setDirectory((prev: string) => prev + "/" + name);
          }
        }}
        draggable={type === "url" && loading === false}
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
        className={` h-32 w-full justify-between p-2 text-content rounded cursor-pointer transition-all ease-in-out duration-300 ${
          type === "url"
            ? "bg-foreground2 hover:bg-foreground2Hover"
            : "folder bg-foreground border-2 border-foreground2"
        }`}
      >
        {name}
      </a>
      {showMenu && ( // Menu when left click
        <div
          ref={menuRef}
          className="absolute bg-buttonSecondary hover:bg-buttonSecondaryHover p-2 text-center rounded shadow-lg"
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
