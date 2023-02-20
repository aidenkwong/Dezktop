import React, { Dispatch, MutableRefObject, SetStateAction } from "react";

const Directory = ({
  dir,
  index,
  directory,
  setDirectory,
  directoryRef,
}: {
  dir: string;
  index: number;
  directory: string;
  setDirectory: Dispatch<SetStateAction<string>>;
  directoryRef: MutableRefObject<(HTMLButtonElement | null)[]>;
}) => {
  return (
    <div>
      {index !== 0 && <i className="text-content">{"  >  "}</i>}
      <button
        className={`directory border-2 border-background2 ${
          index !== directory.split("/").length - 1 &&
          "hover:bg-foreground2Hover"
        }  px-3 py-1 rounded-full bg-foreground2 text-content`}
        data-key={directory
          .split("/")
          .slice(0, index + 1)
          .join("/")}
        ref={(el) => (directoryRef.current[index] = el!!)}
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
    </div>
  );
};

export default Directory;
