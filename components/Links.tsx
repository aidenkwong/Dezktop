import {
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { firebaseDB } from "../firebase/firebase";
import { UserContext } from "../provider/UserProvider";
import Link from "./Link";
import { ReactSortable } from "react-sortablejs";

const Links = () => {
  // useState
  const [loading, setLoading] = useState(false);
  const [bookmarksFromFile, setBookmarksFromFile] = useState<Array<any>>([]);

  // useContext
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user?.uid) {
      const unsub = onSnapshot(
        doc(firebaseDB, "users", user?.uid!!),
        (querySnapshot) => {
          const data = querySnapshot.data();

          if (data) {
            setBookmarksFromFile(data.bookmarks);
          }
        }
      );

      return () => unsub();
    }
    return;
  }, [user]);

  useEffect(() => {
    setLoading(true);
    if (bookmarksFromFile.length > 1) {
      (async () => {
        await updateDoc(doc(firebaseDB, "users", user?.uid!!), {
          bookmarks: bookmarksFromFile,
        });
      })();
    }

    bookmarksFromFile.sort((a, b) => {
      const nameA = a.type.toUpperCase(); // ignore upper and lowercase
      const nameB = b.type.toUpperCase(); // ignore upper and lowercase

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });

    setLoading(false);
  }, [bookmarksFromFile, user?.uid]);

  const handleOnEnd = async () => {};

  // functions
  const deleteLink = async (name: string) => {
    await deleteDoc(doc(firebaseDB, "users", user?.uid!!, "links", name));
  };

  const fileOnChange = async (e: any) => {
    const file = e.target.files[0];
    const fileJson = JSON.parse(await file.text());

    setBookmarksFromFile(fileJson.roots.bookmark_bar.children);
  };

  return (
    <div>
      <ReactSortable
        list={bookmarksFromFile}
        setList={setBookmarksFromFile}
        className="grid grid-cols-auto-224 gap-2"
        swap
        animation={150}
        onEnd={handleOnEnd}
        disabled={loading}
        easing="cubic-bezier(1, 0, 0, 1)"
        draggable=".draggable"
      >
        {bookmarksFromFile.map((link, index) => (
          <div
            key={index}
            data-index={index}
            className={`h-32 w-full justify-between p-1 text-black rounded  ${
              link.type === "url"
                ? "draggable bg-zinc-300"
                : "bg-sky-300 border-2 border-sky-500"
            }`}
          >
            <Link
              key={link.name}
              index={index}
              name={link.name}
              url={link.url}
              deleteLink={deleteLink}
            />
          </div>
        ))}
      </ReactSortable>
      <p>%LocalAppData%\Google\Chrome\User Data\Default\Bookmarks</p>
      <input type="file" onChange={fileOnChange} />
      {bookmarksFromFile?.map((bookmark: any, index: number) => {
        return <div key={index}>{bookmark?.name}</div>;
      })}
    </div>
  );
};

export default Links;
