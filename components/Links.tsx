import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { firebaseDB } from "../firebase/firebase";
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

    if (allLinks.length > 0 && user?.uid) {
      (async () => {
        try {
          await updateDoc(doc(firebaseDB, "users", user?.uid!!), {
            bookmarks: allLinks[0].children,
          });
        } catch (error: any) {
          if (error.code === "not-found") {
            await setDoc(doc(firebaseDB, "users", user?.uid!!), {
              bookmarks: allLinks[0].children,
            });
          }
        }
      })();
    }

    setLoading(false);
  }, [allLinks, user?.uid]);

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

    links.sort((a, b) => {
      return a.type.localeCompare(b.type);
    });

    const handleDragStart = (e: any) => {
      const el = e.currentTarget;

      dragStartKey = el.getAttribute("data-key");

      let crt = el.cloneNode(true);

      crt.setAttribute("id", "crt");
      crt.classList = "";
      crt.classList.add(
        "w-44",
        "h-fit",
        "bg-foreground2",
        "border-edge",
        "border-2",
        "absolute",
        "-top-64",
        "-left-64",
        "rounded"
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
        el.classList.replace("border-edge", "border-foreground2");
      }

      if (el.classList.contains("directory")) {
        el.classList.replace("border-edge", "border-transparent");
        // effect removed
      }
    };

    const handleDragOver = (e: any) => {
      e.preventDefault();
      const el = e.currentTarget;

      if (el.classList.contains("folder")) {
        el.classList.replace("border-foreground2", "border-edge");
      }
      if (
        el.classList.contains("directory") &&
        el.getAttribute("data-key") !== directory
      ) {
        el.classList.replace("border-transparent", "border-edge");
        // effect removed
      }
    };

    const handleDrop = (e: any) => {
      e.preventDefault();

      const el = e.currentTarget;
      const dropKey = e.currentTarget.getAttribute("data-key");

      if (el.classList.contains("folder")) {
        el.classList.replace("border-edge", "border-foreground2");
      }
      if (el.classList.contains("directory")) {
        el.classList.replace("border-edge", "border-transparent");
        // effect removed
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
            {index !== 0 && <i className="text-content">{"  >  "}</i>}
            <button
              className={`directory ${
                index !== directory.split("/").length - 1 &&
                "hover:bg-foreground2Hover"
              } py-2 px-3 rounded-full bg-foreground2 text-content border-2 border-transparent leading-3`}
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
              disabled={index === directory.split("/").length - 1}
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

      <div className="bg-foreground my-2 p-2 w-fit rounded">
        <p>
          To import your bookmarks from chrome, upload the file in the following
          path of your computer:
        </p>
        <p className="flex gap-2">
          Windows:{" "}
          <p className="bg-foreground2 w-fit p-1 rounded text-sm leading-3">
            %LocalAppData%\Google\Chrome\User Data\Default\Bookmarks
          </p>
        </p>
        <p className="flex gap-2">
          Mac:{" "}
          <p className="bg-foreground2 w-fit p-1 rounded text-sm leading-3">
            ~/Library/Application Support/Google/Chrome/Default/Bookmarks
          </p>
        </p>
        <input type="file" onChange={fileOnChange} />
      </div>
    </div>
  );
};

export default Links;
