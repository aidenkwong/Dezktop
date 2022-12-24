import { doc, getFirestore, setDoc } from "firebase/firestore";
import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../provider/UserProvider";
import { firebaseApp } from "../firebase/firebase";

const db = getFirestore(firebaseApp);

const AddLinkForm = ({ setShowAddLinkForm }: any) => {
  // useState
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  // useRef
  const formRef = useRef(null);

  // useContext
  const user = useContext(UserContext);

  // hooks
  const useOutside = (ref: any) => {
    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowAddLinkForm(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  useOutside(formRef);

  // functions
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, "users", user?.uid!!, "links", name), {
      name,
      url,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="gap-2 flex flex-col absolute bg-white p-2 rounded-md border-zinc-900 border-2"
      ref={formRef}
    >
      <div className="gap-2 flex justify-between">
        <label htmlFor="name">name</label>
        <input
          className="border-zinc-900 border-2 outline-0 p-1 text-black"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="gap-2 flex justify-between">
        <label htmlFor="url">URL</label>
        <input
          className="border-zinc-900 border-2 outline-0 p-1 text-black"
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <button className="bg-zinc-900 text-white p-2 rounded-md" type="submit">
        Add Link
      </button>
    </form>
  );
};

export default AddLinkForm;
