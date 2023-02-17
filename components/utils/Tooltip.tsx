import { FC, ReactElement, useState } from "react";

const Tooltip: FC<{ children: ReactElement; title: string }> = ({
  children,
  title,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div
      onMouseOver={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className="relative"
    >
      {children}

      <span
        className="absolute -bottom-8 border-foreground border-[1px] bg-background rounded min-w-max p-1 text-xs delay-100 "
        style={{ visibility: show ? "visible" : "hidden" }}
      >
        {title}
      </span>
    </div>
  );
};

export default Tooltip;
