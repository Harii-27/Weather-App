import { useSelector } from "react-redux";
import { AppState } from "./Store/main";
import { useWeb } from "./hooks/useWeb";
import "./index.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import React from "react";
import Login from "./components/Login";
import MessageBox from "./components/MessageBox";
import Members from "./components/Members";

function App() {

  const currentUser = useSelector((state: AppState) => state.message.currentUser);


  useWeb(currentUser);

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="app-details">
      <div className="app-content">
        <Sidebar />
        <div className="app-main">
          <Header />
          <div className="app-body">
            <div className="message-list">
              <Members />
            </div>
            <div className="message-box">
              <MessageBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
