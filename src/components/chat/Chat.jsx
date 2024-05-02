import "./chat.css";
import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
function Chat() {
  const [chat, setChat] = useState();
  const [Open, setOpen] = useState(false); //emoji
  const [text, setText] = useState(""); //input
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  function time(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6
    );

    // Format the date as desired (e.g., ISO string, custom format)
    const normalDate = date.toISOString(); // Example: "2024-05-01T10:57:05.307Z"
    const newdate = new Date(normalDate);

    // Format the date as desired
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      
    };

    const formattedDate = newdate.toLocaleString(undefined, options);
  

    return formattedDate;
    // console.log(timestamp,'ts')
  }
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  useEffect(() => {
    console.log(isCurrentUserBlocked);
  }, [isCurrentUserBlocked]);

  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
      console.log(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);
  console.log(chat);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
    // console.log(e);
  };
  const handleImg = (e) => {
    if (e.target.files[0]) {
      //this line is for if there is an image
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // console.log(text);
  const handleSend = async () => {
    if (text == "") return;
    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });
      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.date();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
    setImg({
      file: null,
      url: "",
    });
    setText("");
  };
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span>{time(message.createdAt)}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={Open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
}
export default Chat;
