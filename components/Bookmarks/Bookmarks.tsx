import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useRef, useState } from "react";
import { MdAddCircleOutline } from "react-icons/md";

import AddbookmarkForm from "./AddBookmarkForm";
import Bookmark from "./Bookmark";
import Directory from "./Directory";
import ImportBookmarkInstruction from "./ImportBookmarkInstruction";

/*
Component Flow:
1. Get bookmarks from local storage
2. Fetch bookmarks from Supabase
    When bookmarks are updated:
    1. Update bookmarks in local storage
    2. Update bookmarks in Supabase

P.S.
Bookmark is in form of JSON:
{
    name: "My Bookmarks",
    type: "folder",
    children: [
    ]
}
Currently, updating any bookmark will update the whole 'bookmarks' object.
*/

const Bookmarks = () => {
  const supabase = useSupabaseClient(); // Supabase Client Hook
  const user = useUser(); // Supbase User Hook

  const [loading, setLoading] = useState(false); // Loading State for Updating Bookmarks
  const [bookmarks, setBookmarks] = useState<Array<any>>([]); // Bookmarks State
  const [directory, setDirectory] = useState<string>("My Bookmarks"); // Directory State
  const [showAddBookmarkForm, setShowAddBookmarkForm] = useState(false); // Show Add Bookmark Form State

  const bookmarksRef = useRef<Array<HTMLDivElement | null>>([]); // Nodes for Bookmarks
  const directoryRef = useRef<Array<HTMLButtonElement | null>>([]); // Nodes for Directories
  const [allBookmarks, setAllBookmarks] = useState<Array<any>>( // All Bookmarks State
    // Getting bookmarks from local storage
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(`${user?.id}_bookmarks`)!!) || [
          {
            name: "My Bookmarks",
            type: "folder",
            children: [],
          },
        ]
      : [
          {
            name: "My Bookmarks",
            type: "folder",
            children: [],
          },
        ]
  );

  useEffect(() => {
    if (!user?.id) return; // Avoid errors when user is not logged in
    const fetchBookmarks = async () => {
      // Fetch bookmarks from Supbase
      const { data, error } = await supabase
        .from("bookmark")
        .select("bookmark")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setAllBookmarks(data.bookmark);
      } else {
        setAllBookmarks([
          {
            name: "My Bookmarks",
            type: "folder",
            children: [],
          },
        ]);
      }
    };

    fetchBookmarks();
  }, [supabase, user]);

  useEffect(() => {
    if (!user?.id || !allBookmarks) return; // Avoid errors when user is not logged in or allBookmarks is not set
    setLoading(true);
    const updateBookmarks = async () => {
      // Update bookmarks
      localStorage.setItem(
        // Update bookmarks in local storage
        `${user.id}_bookmarks`,
        JSON.stringify(allBookmarks)
      );
      const { error } = await supabase // Update bookmarks in Supabase
        .from("bookmark")
        .upsert({ user_id: user.id, bookmark: allBookmarks });

      if (error) {
        const { error: error2 } = await supabase
          .from("bookmark")
          .update({ bookmark: allBookmarks })
          .eq("user_id", user.id);

        if (error2) {
          console.error(error2);
        }
      }
    };

    updateBookmarks();
    setLoading(false);
  }, [allBookmarks, supabase, user?.id]);

  useEffect(() => {
    setBookmarks((prev) => prev.sort((a, b) => a.type.localeCompare(b.type))); // Reorder the bookmarks in current directory
  }, [bookmarks]);

  useEffect(() => {
    let dragStartKey: string;

    /*
    The following functions are the event handlers for drag and drop.
    */
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
      ); // Styling for the drag node
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
      }

      if (dropKey === directory) return;

      const movedbookmark = bookmarks.find(
        (bookmark) =>
          bookmark.name ===
          dragStartKey.split("/")[dragStartKey.split("/").length - 1]
      );

      let tmpAllBookmarks = allBookmarks;

      /*
      Funnction for Traversing the bookmarks object to remove the dragged bookmark from the old directory and add it to the new directory
      */
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

          for (const bookmark of arr) {
            const duplicate = bookmark.name === movedbookmark.name;
            const duplicateWithNumber = bookmark.name
              .match(/\((\d+)\)/)
              ?.input.slice(0, -3);

            if (duplicate || duplicateWithNumber) {
              duplicateCount++;
            }
          }
          movedbookmark.name =
            duplicateCount == 0
              ? movedbookmark.name
              : `${movedbookmark.name} (${duplicateCount})`;

          arr.push(movedbookmark);
          arr.sort((a, b) => {
            return a.type.localeCompare(b.type);
          });
          setBookmarks(arr);
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

      dfs(tmpAllBookmarks[0].children, dragStartKey, dropKey, 0);

      setAllBookmarks([...tmpAllBookmarks]);
    };

    let tmpbookmarks = [...allBookmarks];
    const directoryArr = directory.split("/");

    for (let i = 0; i < directoryArr.length; i++) {
      const idx = tmpbookmarks.findIndex(
        (bookmark) =>
          bookmark.name === directoryArr[i] && bookmark.type === "folder"
      );

      if (idx === -1) return;
      tmpbookmarks = tmpbookmarks[idx].children;
    }
    tmpbookmarks.sort((a, b) => {
      return a.type.localeCompare(b.type);
    });
    setBookmarks(tmpbookmarks);

    // Populate the refs to bookmarks
    bookmarksRef.current = bookmarksRef?.current?.slice(0, bookmarks.length);

    // Add event listeners to bookmark nodes
    for (let i = 0; i < bookmarks.length; i++) {
      if (bookmarks[i].type === "url") {
        bookmarksRef.current[i]?.addEventListener("dragstart", handleDragStart);
        bookmarksRef.current[i]?.addEventListener("dragend", handleDragEnd);
      }
      if (bookmarks[i].type === "folder") {
        bookmarksRef.current[i]?.addEventListener("dragleave", handleDragLeave);
        bookmarksRef.current[i]?.addEventListener("drop", handleDrop);
      }

      bookmarksRef.current[i]?.addEventListener("dragover", handleDragOver);
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
      for (let i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].type === "url") {
          bookmarksRef.current[i]?.removeEventListener(
            "dragstart",
            handleDragStart
          );
          bookmarksRef.current[i]?.removeEventListener(
            "dragend",
            handleDragEnd
          );
        }
        if (bookmarks[i].type === "folder") {
          bookmarksRef.current[i]?.removeEventListener(
            "dragleave",
            handleDragLeave
          );
          bookmarksRef.current[i]?.removeEventListener("drop", handleDrop);
        }

        bookmarksRef.current[i]?.removeEventListener(
          "dragover",
          handleDragOver
        );
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
  }, [allBookmarks, directory, bookmarks]);

  // functions
  const deleteBookmark = async (key: string) => {
    let tmpAllBookmarks = [...allBookmarks];
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

    dfs(tmpAllBookmarks[0].children, key, 0);

    setAllBookmarks(tmpAllBookmarks);
  };

  // Emit when user upload "Bookmarks" file
  const fileOnChange = async (e: any) => {
    const file = e.target.files[0];
    const fileJson = JSON.parse(await file.text());

    setAllBookmarks([
      {
        name: "My Bookmarks",
        children: fileJson.roots.bookmark_bar.children,
        type: "folder",
      },
    ]);
  };

  return (
    <div className="flex flex-col">
      <div className="hover:resize rounded border border-neutral-500 p-2 my-2 overflow-auto min-w-[196px]">
        <div className="grid gap-2 grid-cols-auto-180">
          <div className="col-span-full flex justify-between">
            <div className="flex gap-2">
              {directory.split("/").map((dir, index) => (
                <Directory
                  key={index}
                  dir={dir}
                  index={index}
                  directory={directory}
                  setDirectory={setDirectory}
                  directoryRef={directoryRef}
                />
              ))}
            </div>
          </div>
          {bookmarks.map((bookmark: any, index) => (
            <Bookmark
              bookmarksRef={bookmarksRef}
              directory={directory}
              setDirectory={setDirectory}
              key={index}
              dataKey={directory + "/" + bookmark.name}
              name={bookmark.name}
              type={bookmark.type}
              url={bookmark.url}
              deleteBookmark={deleteBookmark}
              loading={loading}
              index={index}
              setBookmarks={setBookmarks}
            />
          ))}
          <div
            onClick={() => {
              setShowAddBookmarkForm(true);
            }}
            className="w-fit p-4 bg-foreground2 hover:bg-foreground2Hover flex justify-center items-center rounded opacity-30 cursor-pointer"
          >
            Add shortcut or folder
            <MdAddCircleOutline size={24} />
          </div>
          <AddbookmarkForm
            setShowAddBookmarkForm={setShowAddBookmarkForm}
            showAddBookmarkForm={showAddBookmarkForm}
            bookmarks={bookmarks}
            allBookmarks={allBookmarks}
            setAllBookmarks={setAllBookmarks}
            directory={directory}
          />
        </div>
      </div>
      <p>
        Import your bookmarks from your browser.{" "}
        <input type="file" onChange={fileOnChange} />
      </p>
      <ImportBookmarkInstruction />
    </div>
  );
};

export default Bookmarks;
