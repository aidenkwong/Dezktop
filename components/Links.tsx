import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { firebaseDB } from "../firebase/firebase";
import { ThemeContext } from "../provider/ThemeProvider";
import { UserContext } from "../provider/UserProvider";
import Link from "./Link";

const Links = () => {
  // useState
  const [loading, setLoading] = useState(false);
  const [allLinks, setAllLinks] = useState<Array<any>>([]);
  const [links, setLinks] = useState<Array<any>>([]);
  const [directory, setDirectory] = useState<string>("My Bookmarks");

  // useRef
  const linksRef = useRef<Array<HTMLDivElement | null>>([]);
  const directoryRef = useRef<Array<HTMLButtonElement | null>>([]);

  // useContext
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

  // functions

  useEffect(() => {
    if (user?.uid) {
      (async () => {
        const docRef = doc(firebaseDB, "users", user?.uid!!);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();

        if (data) {
          setAllLinks([
            {
              name: "My Bookmarks",
              type: "folder",
              children: data.bookmarks,
            },
          ]);
        }
      })();
    }
    return;
  }, [user]);

  useEffect(() => {
    setLoading(true);

    if (links.length > 1) {
      (async () => {
        await updateDoc(doc(firebaseDB, "users", user?.uid!!), {
          bookmarks: links,
        });
      })();
    }

    links.sort((a, b) => {
      return a.type.localeCompare(b.type);
    });

    setLoading(false);
  }, [links, user?.uid]);

  useEffect(() => {
    let tmpLinks = allLinks;
    const directoryArr = directory.split("/");

    for (let i = 0; i < directoryArr.length; i++) {
      const idx = tmpLinks.findIndex(
        (link) => link.name === directoryArr[i] && link.type === "folder"
      );

      if (idx === -1) return;
      tmpLinks = tmpLinks[idx].children;
    }
    setLinks(tmpLinks);
  }, [allLinks, directory]);

  useEffect(() => {
    let dragStartKey: string;

    const handleDragStart = (e: any) => {
      const el = e.currentTarget;

      dragStartKey = el.getAttribute("data-key");

      console.log(dragStartKey);
      let crt = el.cloneNode(true);

      crt.setAttribute("id", "crt");

      crt.classList.replace("w-full", "w-44");
      crt.classList.replace("h-32", "h-fit");
      crt.classList.add(
        "border-sky-500",
        "border-2",
        "absolute",
        "-top-64",
        "-left-64"
      );

      document.body.appendChild(crt);
      e.dataTransfer.setDragImage(crt, 0, 0);
    };

    const handleDragEnd = (_e: any) => {
      document.getElementById("crt")?.remove();
    };

    const handleDragLeave = (e: any) => {
      e.preventDefault();
      const el = e.currentTarget;

      if (el.classList.contains("folder")) {
        el.classList.remove("scale-105");
        el.classList.replace("bg-sky-400", "bg-sky-300");
        el.classList.replace("border-sky-900", "border-sky-500");
      }

      if (el.classList.contains("directory")) {
        el.classList.remove(`outline-${theme}-800`);
        el.classList.remove("bg-sky-300");
        el.classList.remove("border-sky-900");
      }
    };

    const handleDragOver = (e: any) => {
      e.preventDefault();
      const el = e.currentTarget;

      if (el.classList.contains("folder")) {
        el.classList.add("scale-105");
        el.classList.replace("bg-sky-300", "bg-sky-400");
        el.classList.replace("border-sky-500", "border-sky-900");
      }
      if (
        el.classList.contains("directory") &&
        el.getAttribute("data-key") !== directory
      ) {
        console.log("over");
        el.classList.add(`outline-${theme}-800`);
        el.classList.add("bg-sky-300");
        el.classList.add("border-sky-900");
      }
    };

    const handleDrop = (e: any) => {
      e.preventDefault();

      const el = e.currentTarget;
      const dropKey = e.currentTarget.getAttribute("data-key");

      if (el.classList.contains("folder")) {
        el.classList.remove("scale-105");
        el.classList.replace("bg-sky-400", "bg-sky-300");
        el.classList.replace("border-sky-900", "border-sky-500");
      }
      if (el.classList.contains("directory")) {
        el.classList.remove(`outline-${theme}-800`);
        el.classList.remove("bg-sky-300");
        el.classList.remove("border-sky-900");
      }

      if (dropKey === directory) return;

      const movedLink = links.find(
        (link) =>
          link.name ===
          dragStartKey.split("/")[dragStartKey.split("/").length - 1]
      );

      let tmpAllLinks = allLinks;

      const dfsDelete = (arr: any[], dir: string) => {
        const curDirArr = dir.split("/");

        if (curDirArr.length === 2) {
          arr.find((link) => link.name === curDirArr[0]).children = arr
            .find((link) => link.name === curDirArr[0])
            .children.filter((link: any) => link.name !== curDirArr[1]);

          return;
        }
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].name === curDirArr[0]) {
            dfsDelete(arr[i].children, curDirArr.slice(1).join("/"));
          }
        }
      };

      dfsDelete(tmpAllLinks, dragStartKey);

      const dfsAppend = (arr: any[], dir: string) => {
        // My Bookmarks, foo, bar
        const curDirArr = dir.split("/");

        if (curDirArr.length === 1) {
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].name === curDirArr[0]) {
              arr[i].children.push(movedLink);
            }
          }
        }

        for (let i = 0; i < arr.length; i++) {
          if (arr[i].name === curDirArr[0]) {
            dfsAppend(arr[i].children, curDirArr.slice(1).join("/"));
          }
        }

        return arr;
      };

      dfsAppend(tmpAllLinks, dropKey);

      setAllLinks([...tmpAllLinks]);
    };

    linksRef.current = linksRef?.current?.slice(0, links.length);
    for (let i = 0; i < links.length; i++) {
      if (links[i].type === "url") {
        linksRef.current[i]?.addEventListener("dragstart", handleDragStart);
        linksRef.current[i]?.addEventListener("dragend", handleDragEnd);
      }
      if (links[i].type === "folder") {
        linksRef.current[i]?.addEventListener("dragleave", handleDragLeave);
        linksRef.current[i]?.addEventListener("drop", handleDrop);
      }

      linksRef.current[i]?.addEventListener("dragover", handleDragOver);
    }

    directoryRef.current = directoryRef?.current?.slice(0, directory.length);
    for (let i = 0; i < directory.length; i++) {
      directoryRef.current[i]?.addEventListener("dragover", handleDragOver);
      directoryRef.current[i]?.addEventListener("dragleave", handleDragLeave);
      directoryRef.current[i]?.addEventListener("drop", handleDrop);
    }

    return () => {
      for (let i = 0; i < links.length; i++) {
        if (links[i].type === "url") {
          linksRef.current[i]?.removeEventListener(
            "dragstart",
            handleDragStart
          );
          linksRef.current[i]?.removeEventListener("dragend", handleDragEnd);
        }
        if (links[i].type === "folder") {
          linksRef.current[i]?.removeEventListener(
            "dragleave",
            handleDragLeave
          );
          linksRef.current[i]?.removeEventListener("drop", handleDrop);
        }

        linksRef.current[i]?.removeEventListener("dragover", handleDragOver);
      }
      for (let i = 0; i < directory.length; i++) {
        directoryRef.current[i]?.removeEventListener(
          "dragover",
          handleDragOver
        );
        directoryRef.current[i]?.removeEventListener(
          "dragleave",
          handleDragLeave
        );
        directoryRef.current[i]?.removeEventListener("drop", handleDrop);
      }
    };
  }, [allLinks, directory, links]);

  // functions
  const deleteLink = async (name: string) => {
    await deleteDoc(doc(firebaseDB, "users", user?.uid!!, "links", name));
  };

  const fileOnChange = async (e: any) => {
    const file = e.target.files[0];
    const fileJson = JSON.parse(await file.text());

    setAllLinks([
      {
        name: "My Bookmarks",
        children: fileJson.roots.bookmark_bar.children,
        type: "folder",
      },
    ]);
  };

  return (
    <div>
      <div className="my-2">
        {directory.split("/").map((dir, index) => (
          <span key={index}>
            {index !== 0 && <i>{"  >  "}</i>}
            <button
              className={`directory outline outline-2 outline-${theme}-500 hover:bg-${theme}-100 bg-${theme}-200 py-2 px-3 rounded-full`}
              data-key={directory
                .split("/")
                .slice(0, index + 1)
                .join("/")}
              ref={(el) => (directoryRef.current[index] = el)}
              key={index}
              onClick={() =>
                setDirectory(
                  directory
                    .split("/")
                    .slice(0, index + 1)
                    .join("/")
                )
              }
            >
              {dir}
            </button>
          </span>
        ))}
      </div>
      <div className="grid gap-2 grid-cols-auto-224">
        {links.map((link: any, index) => (
          <Link
            linksRef={linksRef}
            directory={directory}
            setDirectory={setDirectory}
            key={index}
            dataKey={directory + "/" + link.name}
            name={link.name}
            type={link.type}
            url={link.url}
            deleteLink={deleteLink}
            loading={loading}
            index={index}
          />
        ))}
      </div>

      <p>%LocalAppData%\Google\Chrome\User Data\Default\Bookmarks</p>
      <p>~/Library/Application\ Support/Google/Chrome/Default/Bookmarks</p>
      <input type="file" onChange={fileOnChange} />
    </div>
  );
};

export default Links;
