//after userInfo component we will create the chat list component
import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { db } from "../../../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";
function ChatList() {
  const [chats, setChats] = useState([]); //fetch
  const [addMode, setAddMode] = useState(false);
  //This line gets the current user data using a custom hook called useUserStore.The currentUser object likely contains information about the logged-in user.
  const { currentUser } = useUserStore();
  //When you use onSnapshot() on a document, it’s like having a special listener.This listener keeps an eye on that document all the time.Whenever something changes (like new data arrives), the listener notices it.
  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.recieverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promises)
        setChats(chatData.sort((a,b) => b.updatedAt - a.updatedAt));
      }
    );
    return () => {
      unSub();
    };
  }, [currentUser.id]);

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {chats.map((chat) => (
        <div className="item" key={chat.chatId}>
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>Jane Doe</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
}
export default ChatList;
