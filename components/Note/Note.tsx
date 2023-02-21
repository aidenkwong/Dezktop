import useOutside from "../../helper/hooks/useOutside";
import { useState, useRef, FC, ChangeEvent, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

const Note: FC = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [value, setValue] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const textEditorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("note")
        .select("content")
        .eq("user_id", user.id)
        .eq("name", "note");

      if (error) console.log(error);
      if (data) setValue(data[0].content);
    };

    fetchNote();
  }, [supabase, user]);

  useOutside(textEditorRef, () => {
    if (editing) setEditing(false);
  });

  const onChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (!user) return;
    try {
      const { error } = await supabase.from("note").insert({
        user_id: user.id,
        content: e.target.value,
        name: "note",
      });

      if (error) {
        const { error } = await supabase
          .from("note")
          .update({
            content: e.target.value,
          })
          .eq("user_id", user.id)
          .eq("name", "note");

        if (error) console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
          onChange={(e) => onChange(e)}
        />
      ) : (
        <p className="my-2 p-1 whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
};

export default Note;
