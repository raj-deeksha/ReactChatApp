
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import './adduser.css';
import { db } from '../../../../lib/firebase';
import { useState } from 'react';
import { useUserStore } from '../../../../lib/userStore';
function AddUser() {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async e => {
    e.preventDefault()
    const formData = new FormData(e.target);
    
    const username = formData.get("username");
    // console.log(username);
    try {
      const userRef = collection(db, "users");
      // console.log(userRef);

      // Create a query against the collection.
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
        // console.log(setUser);
      }
    }
    catch (err) {
      console.log(err)
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");//creating
    const userChatsRef = collection(db, "userchats");//creating
    try {
      const newChatRef=doc(chatRef)
      //creating a new chat
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
       console.log(newChatRef.id, chatRef.id, userChatsRef.id, currentUser.id,user.id);
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          recieverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          recieverId: user.id,
          updatedAt: Date.now(),
        }),
      });
     }
    catch (err) {
      console.log(err);
    }
  }
  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && <div className="user">
        <div className="detail">
          <img src={user.avatar || "./avatar.png"} alt="" />
          <span>{user.username}</span>
        </div>
        <button onClick={handleAdd}>Add User</button>
      </div>}
    </div>
  );
}
export default AddUser;
