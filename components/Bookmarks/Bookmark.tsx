import { MdFolderOpen } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import useOutside from "../../helper/hooks/useOutside";
// import Image from "next/image";

const Bookmark = ({
  name,
  url,
  type,
  directory,
  setDirectory,
  bookmarksRef,
  loading,
  index,
  deleteBookmark,
}: any) => {
  // useState
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const [src, setSrc] = useState(
    "https://" + url?.split("/")[2] + "/favicon.ico"
  );
  // "https://s2.googleusercontent.com/s2/favicons?domain=" + url

  // useRef
  const menuRef = useRef(null);

  useOutside(menuRef, () => setShowMenu(false));

  useEffect(() => {
    setSrc("https://" + url?.split("/")[2] + "/favicon.ico");
  }, [directory, url]);

  return (
    <>
      <a
        data-key={directory + "/" + name}
        ref={(el) => (bookmarksRef.current[index] = el)}
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
          setWindowPosition({ x: window.scrollX, y: window.scrollY });

          return false;
        }}
        rel="noreferrer"
        className={`flex gap-2 p-2 text-content rounded cursor-pointer transition-all ease-in-out duration-300 ${
          type === "url"
            ? "bg-foreground2 hover:bg-foreground2Hover"
            : "folder bg-foreground border-2 border-foreground2"
        }`}
      >
        <div className="flex">
          {type === "folder" ? (
            <div className="mt-1 w-4 h-4 mr-2">
              <MdFolderOpen size={16} />
            </div>
          ) : (
            <div className="mt-1 w-4 h-4 mr-2">
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`favicon of ${url}`}
                  src={src}
                  width={16}
                  height={16}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    // setSrc("/assets/favicon-error.svg");
                    setSrc(
                      "https://s2.googleusercontent.com/s2/favicons?domain=" +
                        url
                    );
                  }}
                ></img>
              }
            </div>
          )}
          <p className="w-fit h-fit line-clamp-3 ">
            {name.replace(/(\r\n|\n|\r)/gm, "")}
          </p>
        </div>
      </a>
      {showMenu && ( // Menu when left click
        <div
          ref={menuRef}
          className="absolute bg-background2 p-2 text-center rounded drop-shadow-lg"
          style={{
            left: menuPosition.x + windowPosition.x,
            top: menuPosition.y + windowPosition.y,
            display: "block",
          }}
        >
          <button
            onClick={() => {
              deleteBookmark(directory + "/" + name);
              setShowMenu(false);
            }}
          >
            Delete Bookmark
          </button>
        </div>
      )}
    </>
  );
};

export default Bookmark;
