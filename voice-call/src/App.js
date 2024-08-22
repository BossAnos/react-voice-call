import { useEffect, useRef, useState } from "react";
import { StringeeCall, StringeeClient } from "stringee";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [friendUsername, setFriendUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [friendName, setFriendName] = useState("");

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const stringeeClient = useRef(new StringeeClient());
  let call = useRef(null);

  const settingCallEvent = (settingCall) => {
    settingCall.on("addremotestream", function (stream) {
      console.log("addremotestream", stream);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = null;
        remoteVideo.current.srcObject = stream;
      }
    });

    settingCall.on("addlocalstream", function (stream) {
      console.log("addlocalstream", stream);
      localVideo.current.srcObject = null;
      localVideo.current.srcObject = stream;
    });

    settingCall.on("signalingstate", function (state) {
      console.log("signalingstate", state);
      setCallStatus(state.reason);

      if (state.code === 3) {
        setIsCalling(true);
      } else if ([4, 5, 6].includes(state.code)) {
        setIsCalling(false);
        setLoading(false);
        setHasIncomingCall(false);
      }
    });

    settingCall.on("mediastate", function (state) {
      console.log("mediastate", state);
    });

    settingCall.on("info", (info) => {
      console.log("on info: " + JSON.stringify(info));
    });
  };

  useEffect(() => {
    stringeeClient.current.on("connect", () =>
      console.log("Connected to StringeeServer")
    );

    stringeeClient.current.on("authen", (res) => {
      if (res.message === "SUCCESS") {
        setLoggedIn(true);
      }
    });

    stringeeClient.current.on("incomingcall", (incomingCall) => {
      console.log("incomingCall", incomingCall);
      call.current = incomingCall;
      settingCallEvent(incomingCall);
      setHasIncomingCall(incomingCall);
      setFriendName(incomingCall.fromNumber);
      setLoading(true);
    });
  }, []);

  const onLogin = async () => {
    const res = await fetch(`http://localhost:8000/?u=${username}`);
    const data = await res.json();
    setAccessToken(data.access_token);
    stringeeClient.current.connect(data.access_token);
  };

  const onCall = async () => {
    if (username === friendUsername) {
      alert("You cannot call yourself.");
      return;
    }
    if (isCalling) {
      return;
    }
    setLoading(true);
    call.current = new StringeeClient(
      stringeeClient.current,
      username,
      friendUsername,
      false
    );
    settingCallEvent(call.current);

    if (call.current instanceof StringeeCall) {
      call.current.makeCall(function (res) {
        console.log("make call callback: ", JSON.stringify(res));
        setFriendName(res.toNumber);
      });
    }
  };

  const acceptCall = () => {
    call.current.answer((res) => {
      console.log("answer call callback:", JSON.stringify(res));
      setHasIncomingCall(false);
      setIsCalling(true);
    });
  };

  const rejectCall = () => {
    call.current.reject((res) => {
      console.log("reject call callback:", JSON.stringify(res));
      setHasIncomingCall(false);
      setLoading(false);
    });
  };

  const hangupCall = () => {
    call.current.hangup((res) => {
      console.log("hangup call callback:", JSON.stringify(res));
      setIsCalling(false);
      setLoading(false);
    });
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <h1>Demo: Voice call</h1>

          <p>
            Status: {loggedIn ? `logged in (${username})` : "not logged in"}
          </p>
          {!loggedIn ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onLogin();
              }}
            >
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control w-50"
                  id="username"
                  value={username}
                  autoFocus
                  required
                  placeholder="Enter Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onCall();
              }}
            >
              <div className="mb-3">
                <label htmlFor="friend-username" className="form-label">
                  Who would you like to call?
                </label>
                <input
                  type="text"
                  value={friendUsername}
                  className="form-control w-50"
                  id="friend-username"
                  placeholder="Enter friend's ID"
                  disabled={isCalling || loading}
                  required
                  onChange={(e) => setFriendUsername(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Calling..." : "Call"}
              </button>
            </form>
          )}

          {hasIncomingCall && (
            <div className="mt-3">
              <p>
                You have an incoming call from:{" "}
                <strong>{call?.current?.fromNumber}</strong>
              </p>
              <button className="btn btn-primary me-3" onClick={acceptCall}>
                Answer
              </button>
              <button className="btn btn-danger" onClick={rejectCall}>
                Reject
              </button>
            </div>
          )}

          {isCalling && (
            <div className="mt-3">
              <p>
                Calling: <strong>{friendName}</strong>
              </p>
              <button className="btn btn-danger" onClick={hangupCall}>
                End
              </button>
            </div>
          )}

          <div>
            <video
              ref={localVideo}
              autoPlay
              muted
              style={{ width: "150px" }}
            ></video>
            <video
              ref={remoteVideo}
              autoPlay
              style={{ width: "150px" }}
            ></video>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
