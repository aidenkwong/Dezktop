import React from "react";
import ReactDom from "react-dom";

const MODAL_STYLES = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#FFF",
  padding: "50px",
  zIndex: 1000,
};

const OVERLAY_STYLES = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, .7)",
  zIndex: 1000,
};

export default function AddLinkForm({
  showAddLinkForm,
  children,
  setShowAddLinkForm,
  links,
  setLinks,
  allLinks,
  setAllLinks,
  directory,
}: any) {
  if (!showAddLinkForm) return null;
  const handleSubmit = (e: any) => {
    e.preventDefault();

    const name = e.target[0].value;
    const url = e.target[1].value.startsWith("http")
      ? e.target[1].value
      : "https://" + e.target[1].value;
    const dateAdded = (Date.now() - Date.UTC(1601, 0, 1)) * 1000;
    const type = "url";
    const addedLink = {
      name,
      url,
      date_added: dateAdded + "",
      type,
    };

    let tmpAllLinks = [...allLinks];

    const dfs = (
      arr: any[],
      key: string,

      depth: number
    ) => {
      const keyArr = key.split("/");

      let curDirArr: string[] = [];

      curDirArr = keyArr.slice(0, depth + 1);

      if (keyArr.length - curDirArr.length === 1) {
        arr.push(addedLink);
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

    dfs(tmpAllLinks[0].children, directory + "/" + addedLink.name, 0);

    setAllLinks(tmpAllLinks);
    setShowAddLinkForm(false);
  };

  return ReactDom.createPortal(
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-70 z-50" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-foreground p-12 z-50">
        <button onClick={() => setShowAddLinkForm(false)}>Close Modal</button>
        <form onSubmit={handleSubmit}>
          <input placeholder="name" className="text-black" />
          <input placeholder="url" className="text-black" />
          <button type="submit">Add Shortcut</button>
        </form>
        {children}
      </div>
    </>,
    document.getElementById("portal")!!
  );
}
