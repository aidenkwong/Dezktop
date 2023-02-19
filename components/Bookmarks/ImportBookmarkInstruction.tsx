import { useState } from "react";
import CopyButton from "../utils/CopyButton";

const windowsChromeBookmarksPath =
  "%LocalAppData%\\Microsoft\\Chrome\\User Data\\Default\\Bookmarks";
const windowsEdgeBookmarksPath =
  "%LocalAppData%\\Microsoft\\Edge\\User Data\\Default\\Bookmarks";

const macOsSafariBookmarksPath = "~/Library/Safari/Bookmarks";
const macOsChromeBookmarksPath =
  "~/Library/Application Support/Google/Chrome/Default/Bookmarks";
const macOsEdgeBookmarksPath =
  "~/Library/Application Support/Microsoft Edge/Default/Bookmarks";

function ImportBookmarkInstruction() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="bg-foreground py-1 px-2 w-36 rounded hover:bg-accent"
      >
        {show ? "Hide Instruction" : "Show Instruction"}
      </button>
      {show && (
        <div className="bg-foreground my-2 p-2 w-fit rounded">
          <div className="flex gap-2">
            <span className="w-20"> Windows:</span>
            <ol>
              <li>1. Copy the path below</li>
              <span>Chrome: </span>
              <div className="bg-foreground2 flex-1 p-2 my-2 rounded  leading-3 flex gap-2 items-center justify-between">
                {windowsChromeBookmarksPath}
                <CopyButton size={24} text={windowsChromeBookmarksPath} />
              </div>
              <li>
                <span>Edge: </span>
                <div className="bg-foreground2 flex-1 p-2 my-2 rounded  leading-3 flex gap-2 items-center justify-between">
                  {windowsEdgeBookmarksPath}
                  <CopyButton size={24} text={windowsEdgeBookmarksPath} />
                </div>
              </li>
              <li>2. Click Choose File</li>
              <li>3. Paste the path into the address bar</li>
              <li>4. press enter</li>
            </ol>
          </div>
          <div className="flex gap-2">
            <span className="w-20"> MacOS</span>
            <div>
              <ol>
                <li>1. Copy the path below</li>
                <li>
                  <span>Chrome: </span>
                  <div className="bg-foreground2 flex-1 p-2 my-2 rounded  leading-3 flex gap-2 items-center justify-between">
                    {macOsChromeBookmarksPath}
                    <CopyButton size={24} text={macOsChromeBookmarksPath} />
                  </div>
                </li>
                <li>
                  <span>Safari: </span>
                  <div className="bg-foreground2 flex-1 p-2 my-2 rounded  leading-3 flex gap-2 items-center justify-between">
                    {macOsSafariBookmarksPath}
                    <CopyButton size={24} text={macOsSafariBookmarksPath} />
                  </div>
                </li>
                <li>
                  <span>Edge: </span>
                  <div className="bg-foreground2 flex-1 p-2 my-2 rounded  leading-3 flex gap-2 items-center justify-between">
                    {macOsEdgeBookmarksPath}
                    <CopyButton size={24} text={macOsEdgeBookmarksPath} />
                  </div>
                </li>
                <li>2. Click Choose File</li>
                <li>3. Press shift + cmd + g</li>
                <li>4. Enter the path above and press enter</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImportBookmarkInstruction;
