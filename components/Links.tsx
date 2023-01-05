import { deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { firebaseDB } from "../firebase/firebase";
import { UserContext } from "../provider/UserProvider";
import Link from "./Link";

const Links = () => {
  // useState
  const [loading, setLoading] = useState(false);
  const [allLinks, setAllLinks] = useState<Array<any>>([]);
  const [links, setLinks] = useState<Array<any>>([]);
  const [directory, setDirectory] = useState<Array<string>>([]);

  // useRef
  const linksRef = useRef<Array<HTMLDivElement | null>>([]);

  // useContext
  const { user } = useContext(UserContext);

  // functions

  useEffect(() => {
    if (user?.uid) {
      const unsub = onSnapshot(
        doc(firebaseDB, "users", user?.uid!!),
        (querySnapshot) => {
          const data = querySnapshot.data();

          if (data) {
            setAllLinks(data.bookmarks);
          }
        }
      );

      return () => unsub();
    }
    return;
  }, [user]);

  useEffect(() => {
    setLoading(true);
    // if (links.length > 1) {
    //   (async () => {
    //     await updateDoc(doc(firebaseDB, "users", user?.uid!!), {
    //       bookmarks: links,
    //     });
    //   })();
    // }

    links.sort((a, b) => {
      return a.type.localeCompare(b.type);
    });

    setLoading(false);
  }, [links, user?.uid]);

  useEffect(() => {
    let tmpLinks = allLinks;

    console.log(directory, tmpLinks);
    for (let i = 0; i < directory.length; i++) {
      const idx = tmpLinks.findIndex(
        (link) => link.name === directory[i] && link.type === "folder"
      );

      if (idx !== -1) {
        tmpLinks = tmpLinks[idx].children;
      }
    }
    setLinks(tmpLinks);
  }, [allLinks, directory]);

  useEffect(() => {
    let dragStartId: string;
    const handleDragStart = (e: any) => {
      console.dir("dragstart key: " + e.target.getAttribute("data-id"));
      dragStartId = e.target.getAttribute("data-id");
    };

    const handleDragEnter = (e: any) => {
      console.dir("dragenter key: " + e.target.getAttribute("data-id"));
      const dragOverIdx = e.target.getAttribute("data-id");
      const idx = links.findIndex(
        (link) => link.name === dragOverIdx && link.type === "folder"
      );

      linksRef.current[idx]?.classList.add("scale-105");
      linksRef.current[idx]?.classList.replace("bg-sky-300", "bg-sky-400");
      linksRef.current[idx]?.classList.replace(
        "border-sky-500",
        "border-sky-900"
      );
    };

    const handleDragLeave = (e: any) => {
      console.dir("dragleave key: " + e.target.getAttribute("data-id"));
      const dragOverIdx = e.target.getAttribute("data-id");
      const idx = links.findIndex(
        (link) => link.name === dragOverIdx && link.type === "folder"
      );

      linksRef.current[idx]?.classList.remove("scale-105");
      linksRef.current[idx]?.classList.replace("bg-sky-400", "bg-sky-300");
      linksRef.current[idx]?.classList.replace(
        "border-sky-900",
        "border-sky-500"
      );
    };

    const handleDragOver = (e: any) => {
      e.preventDefault();
      console.dir("dragover key: " + e.target.getAttribute("data-id"));
      const dragOverIdx = e.target.getAttribute("data-id");
      const idx = links.findIndex(
        (link) => link.name === dragOverIdx && link.type === "folder"
      );

      linksRef.current[idx]?.classList.add("scale-105");
      linksRef.current[idx]?.classList.replace("bg-sky-300", "bg-sky-400");
      linksRef.current[idx]?.classList.replace(
        "border-sky-500",
        "border-sky-900"
      );
    };

    const handleDrop = (e: any) => {
      e.preventDefault();

      const dropKey = e.target.getAttribute("data-id");
      const idx = links.findIndex(
        (link) => link.name === dropKey && link.type === "folder"
      );

      const dragStartKey = dragStartId;
      const movedLink = links.find((link) => link.name === dragStartKey);
      let tmpLinks = links.filter((link) => link.name !== dragStartKey);

      tmpLinks.find((link) => link.name === dropKey)?.children.push(movedLink);

      setLinks(tmpLinks);

      linksRef.current[idx]?.classList.remove("scale-105");
      linksRef.current[idx]?.classList.replace("bg-sky-400", "bg-sky-300");
      linksRef.current[idx]?.classList.replace(
        "border-sky-900",
        "border-sky-500"
      );
    };

    linksRef.current = linksRef?.current?.slice(0, links.length);
    for (let i = 0; i < links.length; i++) {
      if (links[i].type === "url") {
        linksRef.current[i]?.addEventListener("dragstart", handleDragStart);
      }
      if (links[i].type === "folder") {
        linksRef.current[i]?.addEventListener("dragenter", handleDragEnter);
        linksRef.current[i]?.addEventListener("dragleave", handleDragLeave);
        linksRef.current[i]?.addEventListener("drop", handleDrop);
      }

      linksRef.current[i]?.addEventListener("dragover", handleDragOver);
    }

    return () => {
      for (let i = 0; i < links.length; i++) {
        if (links[i].type === "url") {
          linksRef.current[i]?.removeEventListener(
            "dragstart",
            handleDragStart
          );
        }
        if (links[i].type === "folder") {
          linksRef.current[i]?.removeEventListener(
            "dragenter",
            handleDragEnter
          );
          linksRef.current[i]?.removeEventListener(
            "dragleave",
            handleDragLeave
          );
          linksRef.current[i]?.removeEventListener("drop", handleDrop);
        }

        linksRef.current[i]?.removeEventListener("dragover", handleDragOver);
      }
    };
  }, [links]);

  // useEffect(() => {
  //   const folders = document.getElementsByClassName("folder");

  //   for (let i = 0; i < folders.length; i++) {
  //     folders[i].addEventListener("drop", (e: any) => {
  //       console.log(e.target.getAttribute("data-index"));
  //     });
  //   }

  //   return () => {
  //     for (let i = 0; i < folders.length; i++) {
  //       folders[i].removeEventListener("drop", (e: any) => {
  //         console.log(e.target.getAttribute("data-index"));
  //       });
  //     }
  //   };
  // }, [linksRef]);

  // const handleOnMove = (
  //   evt: MoveEvent,
  //   originalEvent: Event,
  //   sortable: Sortable | null,
  //   store: Store
  // ) => {
  //   console.log(evt.dragged);
  //   console.log(evt.relatedRect);
  // };

  // functions
  const deleteLink = async (name: string) => {
    await deleteDoc(doc(firebaseDB, "users", user?.uid!!, "links", name));
  };

  const fileOnChange = async (e: any) => {
    const file = e.target.files[0];
    const fileJson = JSON.parse(await file.text());

    setAllLinks(fileJson.roots.bookmark_bar.children);
  };

  return (
    <div>
      {/* <ReactSortable
        list={links}
        setList={setLinks}
        className="grid grid-cols-auto-224 gap-2"
        swap
        animation={150}
        // onMove={handleOnMove}
        disabled={loading}
        easing="cubic-bezier(1, 0, 0, 1)"
        draggable=".draggable"
      >
        {links.map((link, index) => (
          <div
            ref={(el) => (linksRef.current[index] = el)}
            key={index}
            data-index={index}
            className={`h-32 w-full justify-between p-1 text-black rounded  ${
              link.type === "url"
                ? "draggable bg-zinc-300"
                : "folder bg-sky-300 border-2 border-sky-500"
            }`}
          >
            <Link
              key={link.name}
              index={index}
              name={link.name}
              url={link.url}
              deleteLink={deleteLink}
            />
          </div>
        ))}
      </ReactSortable> */}
      <div className="my-2">
        <button
          className="hover:bg-zinc-200 p-1 rounded-sm"
          onClick={() => setDirectory([])}
        >
          My Bookmarks
        </button>
        {directory.map((dir, index) => (
          <>
            <i>{"  >  "}</i>
            <button
              className="hover:bg-zinc-200 p-1 rounded-sm"
              key={index}
              onClick={() => setDirectory(directory.slice(0, index + 1))}
            >
              {dir}
            </button>
          </>
        ))}
      </div>
      <div className="grid gap-2 grid-cols-auto-224">
        {links.map((link: any, index) => (
          <div
            key={index}
            className={`h-32 w-full justify-between p-1 text-black rounded transition-transform ease-in-out duration-300 cursor-pointer ${
              link.type === "url"
                ? "draggable bg-zinc-300"
                : "folder bg-sky-300 border-2 border-sky-500"
            }`}
            data-id={link.name}
            ref={(el) => (linksRef.current[index] = el)}
            onClick={() => {
              if (link.type === "folder") {
                if (directory[directory.length - 1] === link.name) return;
                setDirectory((prev) => [...prev, link.name]);
              }
            }}
          >
            <Link name={link.name} url={link.url} deleteLink={deleteLink} />
          </div>
        ))}
      </div>

      <p>%LocalAppData%\Google\Chrome\User Data\Default\Bookmarks</p>
      <p>~/Library/Application\ Support/Google/Chrome/Default/Bookmarks</p>
      <input type="file" onChange={fileOnChange} />
    </div>
  );
};

export default Links;
