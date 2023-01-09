import React, { useState } from "react";
import ReactDom from "react-dom";

type FormData = {
  name: string;
  type: string;
  url: string;
};

export default function AddLinkForm({
  showAddLinkForm,
  children,
  setShowAddLinkForm,
  allLinks,
  setAllLinks,
  directory,
}: any) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "url",
    url: "",
  });

  if (!showAddLinkForm) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (formData.name.length === 0) return;

    const dateAdded = (Date.now() - Date.UTC(1601, 0, 1)) * 1000;
    const addedLink =
      formData.type === "folder"
        ? {
            name: formData.name,
            type: "folder",
            children: [],
            date_added: dateAdded,
          }
        : {
            name: formData.name,
            type: "url",
            url: formData.url.startsWith("http")
              ? formData.url
              : "https://" + formData.url,
            date_added: dateAdded,
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
        let duplicateCount = 0;

        for (const link of arr) {
          const duplicate = link.name === addedLink.name;
          const duplicateWithNumber = link.name
            .match(/\((\d+)\)/)
            ?.input.slice(0, -3);

          if (duplicate || duplicateWithNumber) {
            duplicateCount++;
          }
        }
        addedLink.name =
          addedLink.name + `${duplicateCount > 0 && `(${duplicateCount})`}`;
        arr.push(addedLink);
        arr.sort((a, b) => {
          return a.type.localeCompare(b.type);
        });
        // setLinks(arr);
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
    setFormData({ name: "", type: "url", url: "" });
    setShowAddLinkForm(false);
  };

  return ReactDom.createPortal(
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-70 z-50" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background2 z-50 rounded-lg drop-shadow w-[512px]">
        <form onSubmit={handleSubmit} className="grid p-4 gap-2 text-sm">
          <div>Add shortcut or folder</div>
          <div>
            <div className="mb-1">
              <label className="w-10 text-xs">name</label>
            </div>
            <input
              autoFocus
              maxLength={50}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="text-black px-2 w-full bg-background text-content outline-none focus:outline-foreground p-1"
            />
          </div>
          <div>
            <div className="mb-1">
              <label className="w-10 mr-3 text-xs">type</label>
            </div>
            <select
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
              name="type"
              defaultValue="url"
              className="bg-background text-context p-1 outline-none focus:outline-foreground"
            >
              <option value="url">url</option>
              <option value="folder">folder</option>
            </select>
          </div>
          {formData.type === "url" && (
            <div>
              <div className="mb-2">
                <label className="w-10 mb-1 text-xs">url</label>
              </div>
              <input
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    url: e.target.value,
                  }))
                }
                className="text-black px-2 w-full bg-background text-content outline-none focus:outline-foreground p-1"
              />
            </div>
          )}
          <div className="flex">
            <button
              className="border-2 border-foreground w-20 py-2 mr-2 rounded"
              onClick={() => setShowAddLinkForm(false)}
            >
              Cancel
            </button>
            <button
              className="bg-button hover:bg-buttonHover w-20 py-2 mr-2 rounded"
              type="submit"
            >
              Add
            </button>
          </div>
        </form>
        {children}
      </div>
    </>,
    document.getElementById("portal")!!
  );
}
