import useOutside from "../../helper/hooks/useOutside";
import { useState, useRef } from "react";

const Note = () => {
  const [value, setValue] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const textEditorRef = useRef<HTMLDivElement>(null);

  useOutside(textEditorRef, () => {
    if (editing) setEditing(false);
  });

  return (
    <div
      className="hover:resize rounded border border-neutral-500 p-2 my-2 overflow-auto min-w-[196px] flex flex-col cursor-pointer"
      onClick={() => setEditing(true)}
      ref={textEditorRef}
    >
      <p className="text-neutral-500 p-1">Note</p>
      {editing ? (
        <textarea
          className="resize-none outline-none my-2 p-1 bg-background2 flex-auto"
          placeholder="Type something..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <p className="my-2 p-1">{value}</p>
      )}
    </div>
  );
};

export default Note;
