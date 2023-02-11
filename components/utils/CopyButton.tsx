import { useState } from "react";
import { MdContentCopy, MdDone } from "react-icons/md";

function CopyButton({ text, size }: { text: string; size: number }) {
  const [copied, setCopied] = useState(false);

  return (
    <>
      {copied ? (
        <MdDone size={size} className="cursor-pointer" />
      ) : (
        <MdContentCopy
          size={size}
          className="cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 5000);
          }}
        />
      )}
    </>
  );
}

export default CopyButton;
