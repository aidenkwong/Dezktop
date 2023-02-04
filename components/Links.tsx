import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import { firebaseDB } from "../firebase/firebase";
import { UserContext } from "../provider/UserProvider";
import AddLinkForm from "./AddLinkForm";
import Link from "./Link";

const Links = () => {
  // useState
  const [loading, setLoading] = useState(false);
  const [allLinks, setAllLinks] = useState<Array<any>>(
    localStorage.getItem("links")
      ? JSON.parse(localStorage.getItem("links")!!)
      : []
  );
  const [links, setLinks] = useState<Array<any>>([]);
  const [directory, setDirectory] = useState<string>("My Bookmarks");
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);

  // useRef
  const linksRef = useRef<Array<HTMLDivElement | null>>([]);
  const directoryRef = useRef<Array<HTMLButtonElement | null>>([]);

  // useContext
  const { user } = useContext(UserContext);

  // useEffect
  useEffect(() => {
    if (user?.uid) {
      (async () => {
        try {
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
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    if (allLinks.length > 0 && user?.uid) {
      (async () => {
        localStorage.setItem("links", JSON.stringify(allLinks));
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
          console.error(error);
        }
      })();
    }
    setLoading(false);
  }, [allLinks, user?.uid]);

  useEffect(() => {
    setLinks((prev) => prev.sort((a, b) => a.type.localeCompare(b.type)));
  }, [links]);

  // useEffect(() => {
  //   let tmpLinks = allLinks;
  //   const directoryArr = directory.split("/");

  //   for (let i = 0; i < directoryArr.length; i++) {
  //     const idx = tmpLinks.findIndex(
  //       (link) => link.name === directoryArr[i] && link.type === "folder"
  //     );

  //     if (idx === -1) return;
  //     tmpLinks = tmpLinks[idx].children;
  //   }
  //   setLinks(tmpLinks);
  // }, [allLinks, directory]);

  // add event listeners and refs
  useEffect(() => {
    let dragStartKey: string;

    // Start of event listener functions for DND API
    const handleDragStart = (e: any) => {
      const el = e.currentTarget;

      dragStartKey = el.getAttribute("data-key");
      let crt = el.cloneNode(true);

      crt.setAttribute("id", "crt");
      crt.classList = "";
      // classList for the dragging element
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

      const dfs = (
        arr: any[],
        startKey: string,
        dropKey: string,
        depth: number
      ) => {
        const startKeyArr = startKey.split("/");
        const dropKeyArr = dropKey.split("/");

        let curDirArr: string[] = [];

        if (startKeyArr.length > dropKeyArr.length) {
          curDirArr = startKeyArr.slice(0, depth + 1);
        } else {
          curDirArr = dropKeyArr.slice(0, depth + 1);
        }

        if (curDirArr.join("/") === dropKeyArr.join("/")) {
          let duplicateCount = 0;

          for (const link of arr) {
            const duplicate = link.name === movedLink.name;
            const duplicateWithNumber = link.name
              .match(/\((\d+)\)/)
              ?.input.slice(0, -3);

            if (duplicate || duplicateWithNumber) {
              duplicateCount++;
            }
          }
          movedLink.name =
            movedLink.name + `${duplicateCount > 0 && `(${duplicateCount})`}}`;

          arr.push(movedLink);
          arr.sort((a, b) => {
            return a.type.localeCompare(b.type);
          });
          setLinks(arr);
        }

        if (startKeyArr.length - curDirArr.length === 1) {
          const idx = arr.findIndex((v) => {
            return v.name === startKeyArr[startKeyArr.length - 1];
          });

          arr.splice(idx, 1);
          arr.sort((a, b) => {
            return a.type.localeCompare(b.type);
          });
        }
        depth++;
        if (startKeyArr.length > dropKeyArr.length) {
          curDirArr = startKeyArr.slice(0, depth + 1);
        } else {
          curDirArr = dropKeyArr.slice(0, depth + 1);
        }
        for (let i = 0; i < arr.length; i++) {
          if (
            arr[i].name === curDirArr[curDirArr.length - 1] &&
            arr[i].children
          ) {
            dfs(arr[i].children, startKey, dropKey, depth);
          }
        }
      };

      dfs(tmpAllLinks[0].children, dragStartKey, dropKey, 0);

      setAllLinks([...tmpAllLinks]);
    };
    // End of event listener functions for DND API

    // Set the links in current directory
    let tmpLinks = [...allLinks];
    const directoryArr = directory.split("/");

    for (let i = 0; i < directoryArr.length; i++) {
      const idx = tmpLinks.findIndex(
        (link) => link.name === directoryArr[i] && link.type === "folder"
      );

      if (idx === -1) return;
      tmpLinks = tmpLinks[idx].children;
    }
    tmpLinks.sort((a, b) => {
      return a.type.localeCompare(b.type);
    });
    setLinks(tmpLinks);

    // Populate the refs to links
    linksRef.current = linksRef?.current?.slice(0, links.length);

    // Add event listeners to link nodes
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

    // Populate the refs to directories
    directoryRef.current = directoryRef?.current?.slice(0, directory.length);

    // Add event listeners to directory nodes
    for (let i = 0; i < directory.length; i++) {
      directoryRef.current[i]?.addEventListener("dragover", handleDragOver);
      directoryRef.current[i]?.addEventListener("dragleave", handleDragLeave);
      directoryRef.current[i]?.addEventListener("drop", handleDrop);
    }

    // Remove event listeners when unmounting
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
  const deleteLink = async (key: string) => {
    let tmpAllLinks = [...allLinks];
    const dfs = (arr: any[], key: string, depth: number) => {
      const keyArr = key.split("/");
      let curDirArr: string[] = [];

      curDirArr = keyArr.slice(0, depth + 1);

      if (keyArr.length - curDirArr.length === 1) {
        const idx = arr.findIndex((v) => {
          return v.name === keyArr[keyArr.length - 1];
        });

        arr.splice(idx, 1);
      }

      depth++;
      curDirArr = keyArr.slice(0, depth + 1);
      for (let i = 0; i < arr.length; i++) {
        if (
          arr[i].name === curDirArr[curDirArr.length - 1] &&
          arr[i].children
        ) {
          dfs(arr[i].children, key, depth);
        }
      }
    };

    dfs(tmpAllLinks[0].children, key, 0);

    setAllLinks(tmpAllLinks);
  };

  // Emit when user upload "Bookmarks" file
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
        <div className="grid gap-2 grid-cols-auto-224">
          <div className="col-span-full flex justify-between">
            <div>
              {directory.split("/").map((dir, index) => (
                <span key={index}>
                  {index !== 0 && <i className="text-content">{"  >  "}</i>}
                  <button
                    className={`directory ${
                      index !== directory.split("/").length - 1 &&
                      "hover:bg-foreground2Hover"
                    }  px-3 rounded-full bg-foreground2 text-content border-2 border-transparent`}
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
          </div>
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
              setLinks={setLinks}
            />
          ))}
          <div
            onClick={() => {
              setShowAddLinkForm(true);
            }}
            className="h-32 gap-1 w-full bg-foreground2 hover:bg-foreground2Hover flex justify-center items-center rounded opacity-30 cursor-pointer"
          >
            Add shortcut or folder
            <MdAddCircleOutline size={24} />
          </div>
          <AddLinkForm
            setShowAddLinkForm={setShowAddLinkForm}
            showAddLinkForm={showAddLinkForm}
            links={links}
            allLinks={allLinks}
            setAllLinks={setAllLinks}
            directory={directory}
          />
        </div>
      </div>

      <div className="bg-foreground my-2 p-2 w-fit rounded">
        <p>
          To import your bookmarks from chrome, upload the file in the following
          path of your computer:
        </p>
        <div className="flex gap-2">
          Windows:{" "}
          <p className="bg-foreground2 w-fit p-1 rounded text-sm leading-3">
            %LocalAppData%\Google\Chrome\User Data\Default\Bookmarks
          </p>
        </div>
        <div className="flex gap-2">
          Mac:{" "}
          <div>
            <ol>
              <li>1. Click Choose File</li>
              <li>2. Press shift + cmd + g</li>
              <li>3. Enter the following path and press enter:</li>
              <li className="bg-foreground2 w-fit p-1 rounded text-sm leading-3">
                ~/Library/Application Support/Google/Chrome/Default/Bookmarks
              </li>
            </ol>
          </div>
        </div>
        <input type="file" onChange={fileOnChange} />
      </div>
    </div>
  );
};

export default Links;
