import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { firebaseDB } from "../firebase/firebase";
import { UserContext } from "../provider/UserProvider";
import Link from "./Link";
import { ReactSortable } from "react-sortablejs";

const Links = () => {
  // useState
  const [links, setLinks] = useState<
    Array<{ id: number; name: string; url: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [bookmarksFromFile, setBookmarksFromFile] = useState<Array<any>>([]);

  // useContext
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user?.uid) {
      const unsub = onSnapshot(
        collection(firebaseDB, "users", user.uid, "links"),
        (querySnapshot) => {
          const links: Array<{ id: number; name: string; url: string }> = [];

          querySnapshot.forEach((doc) => {
            links.push({
              id: doc.data().index || links.length,
              name: doc.data().name,
              url: doc.data().url,
            });
          });
          setLinks(links.sort((a, b) => a.id - b.id));
        }
      );

      return () => unsub();
    }
    return;
  }, [user]);

  const handleOnEnd = async (event: any) => {
    // setLoading(true);
    // const { newIndex, oldIndex } = event;
    // const newLinks = [...links];
    // const movedLink = newLinks.splice(oldIndex, 1)[0];
    // newLinks.splice(newIndex, 0, movedLink);
    // setLinks(newLinks);
    // newLinks.forEach(async (link, index) => {
    //   await updateDoc(
    //     doc(firebaseDB, "users", user?.uid!!, "links", link.name),
    //     {
    //       index,
    //     }
    //   );
    // });
    // setLoading(false);
  };

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
