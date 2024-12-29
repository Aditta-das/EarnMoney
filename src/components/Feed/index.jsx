import './feed.css';
import { signOutUser } from '../Signout';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function Feed() {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [videos, setVideos] = useState([]);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [isVideoLocked, setIsVideoLocked] = useState(false); // Track if another video can be watched
  const [timeLeft, setTimeLeft] = useState(0); // Timer for 2 minutes
  const [points, setPoints] = useState(0);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [money, setMoney] = useState(0);
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState("");
  const [profname, setProfname] = useState("");
  let converter = 2;
  let cashoutval = 20;

  useEffect(() => {
    const auth = getAuth();

    // Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If no user is authenticated, redirect to login
        navigate("/login");
      }
    });

    // Cleanup the subscription
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Fetch videos from Firestore
    const unsubscribe = onSnapshot(collection(db, 'videos'), (snapshot) => {
      const videoData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVideos(videoData); // Update state with fetched videos
    });

    return () => unsubscribe();
  }, []);


  const logoutHandler = () => {
    signOutUser(navigate);
  };

  const openModal = () => {
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    console.log("Adding video to Firestore...");

    try {
      const auth = getAuth();
      const user = auth.currentUser; // Get the currently logged-in user

      if (!user) {
        alert("User not authenticated. Please log in.");
        return;
      }

      const userDocRef = doc(db, "Users", user.uid); // Reference to the user document
      const userDocSnap = await getDoc(userDocRef); // Fetch the user document

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data(); // Get user data from the document
        const username = userData.username; // Extract username

        // Ensure the video URL is in the embeddable format
        let videoUrlEmbed = videoUrl;
        if (videoUrl.includes("youtube.com/watch?v=")) {
          // Extract the videoId from the regular YouTube URL and convert to embeddable URL
          const videoId = videoUrl.split("v=")[1].split("&")[0];
          videoUrlEmbed = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes("youtu.be/")) {
          // Shortened YouTube URL (youtu.be)
          const videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
          videoUrlEmbed = `https://www.youtube.com/embed/${videoId}`;
        }

        // Add the video to Firestore
        await addDoc(collection(db, "videos"), {
          videoUrl: videoUrlEmbed,
          channelName,
          username, // Add the username from the Users collection
          timestamp: new Date(), // Add a timestamp
        });

        alert("Video added successfully!");
        setVideoUrl(""); // Clear the input fields
        setChannelName("");
        closeModal(); // Close the modal after submission
      } else {
        alert("User document not found.");
      }
    } catch (error) {
      console.error("Error adding video: ", error);
      alert("Failed to add video.");
    }
  };

  const handleVideoClick = (video) => {
    const currentTime = new Date().getTime();

    if (isVideoLocked) {
      alert("Please wait for the current video to finish.");
      return;
    }

    // Lock all buttons while the video is playing
    setIsVideoLocked(true);
    setCurrentPlaying(video.id);

    // Start the timer for 2 minutes (120 seconds)
    setTimeLeft(5);


    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsVideoLocked(false); // Unlock after 2 minutes
          earnTT(); // Call earnTT after timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    // Modify the video URL to include autoplay and mute
    let videoUrlWithParams = video.videoUrl;
    if (videoUrlWithParams.includes("?")) {
      // If the URL already has query parameters, append to them
      videoUrlWithParams += "&autoplay=1&mute=1";
    } else {
      // Otherwise, add them as the first query parameters
      videoUrlWithParams += "?autoplay=1&mute=1";
    }

    // Update the iframe with the modified video URL
    const iframe = document.getElementById(`iframe-${video.id}`);
    if (iframe) {
      // Set the iframe src with the updated URL
      iframe.src = videoUrlWithParams;
    }
  };

  const earnTT = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("No user logged in.");
      return;
    }

    try {
      // Reference to the user's points document in the Points collection
      const userPointsRef = doc(db, "Points", user.uid);

      // Reference to the user's details document in the UserDetails collection
      const userMoneyRef = doc(db, "MoneyRequest", user.uid);

      // Fetch user document from Users collection
      const userDocRef = doc(db, "Users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        alert("User data not found.");
        return;
      }

      const userData = userDocSnap.data(); // Get the user data
      const username = userData.username || "Anonymous"; // Fetch username from user data, fallback to "Anonymous"
      // Get the current points data
      const userPointsSnap = await getDoc(userPointsRef);

      let newPoints = 0.1; // Default points to add

      if (userPointsSnap.exists()) {
        // If points document exists, add 0.1 to current points
        const userPoints = userPointsSnap.data().points || 0;
        newPoints = userPoints + 0.1;
      }

      const updatedMoney = Math.floor(newPoints / converter);

      // Update or create the user's points
      await setDoc(userPointsRef, {
        points: newPoints, // Set updated points
        username, // Set username fetched from the Users collection
        email: user.email || "No email provided", // Set email
        money: updatedMoney, // Updated money
      });

      // Update or create the user's details in the UserDetails collection
      await setDoc(userMoneyRef, {
        email: user.email || "No email provided",
        phoneNumber: mobileNumber || "Not provided", // Use the current state of `mobileNumber`
        money: updatedMoney, // Set updated money
      });

      // Update the state to reflect changes
      setPoints(newPoints);
      setMoney(updatedMoney);
    } catch (error) {
      console.error("Error updating user details: ", error);
      alert("Failed to update user details.");
    }
  };


  const handleRedeem = () => {
    if (money >= cashoutval) {
      openRedeemModal();
    } else {
      alert("Not enough tokens to redeem cash.");
    }
  };

  const openRedeemModal = () => {
    setIsRedeemModalOpen(true);
  };

  const closeRedeemModal = () => {
    setIsRedeemModalOpen(false);
  };


  const handleMobileInput = (e) => {
    const value = e.target.value;
    // Allow only numbers (digits) and limit to 10-15 digits
    const phoneRegex = /^[0-9]{0,11}$/;

    if (phoneRegex.test(value)) {
      setMobileNumber(value);
      setError('');
    } else {
      setError('Invalid mobile number. Only numbers are allowed, with a maximum of 15 digits.');
    }
  };

  const handleNumberSubmit = async (e) => {
    e.preventDefault();
    if (mobileNumber.length < 11) {
      alert("Mobile number must be 11 digits.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("No user logged in.");
      return;
    }

    try {
      // Reference to the user's details document in the UserDetails collection
      const userMoneyRef = doc(db, "MoneyRequest", user.uid);

      // Update or create the user's details with the phone number
      await setDoc(userMoneyRef, {
        email: user.email || "No email provided",
        phoneNumber: mobileNumber, // Save the submitted mobile number
        money, // Save the current money state
      });

      const userPointsRef = doc(db, "Points", user.uid);
      await updateDoc(userPointsRef, {
        points: 0, // Reset TT to 0
        money: 0, // Reset money to 0
      });

      // Update the state to reflect the changes
      setPoints(0);
      setMoney(0);
      setMobileNumber('');
      setIsRedeemModalOpen(false);

      alert(`Mobile number submitted: ${mobileNumber}`);
    } catch (error) {
      console.error("Error saving mobile number: ", error);
      alert("Failed to save mobile number.");
    }
  };


  return (
    <div id="webcrumbs">
      <div className="w-[1080px] bg-black text-neutral-50 rounded-lg shadow-lg p-6 min-h-[800px]">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-title">Watch Video</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" style={{ color: "#fff" }}>Profile</Link>
            <button
              className="addBtn text-primary-50 px-4 py-2 rounded-md"
              onClick={openModal} // Open the modal when clicked
            >
              Add +
            </button>
            <button
              className="bg-primary-500 text-primary-50 px-4 py-2 rounded-md"
              onClick={logoutHandler}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Modal Popup */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="p-6 rounded-md shadow-lg max-w-md w-full">
              <h2 className="text-xl mb-4">Add New Video</h2>
              <div>
                {/* Your modal content goes here */}
                <form>
                  <input
                    type="url"
                    placeholder="Enter video URL"
                    className="formBlanks p-2 mb-4 border rounded-md w-full"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Channel Name"
                    className="formBlanks p-2 mb-4 border rounded-md w-full"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                  />
                  <button onClick={handleAddVideo}
                    type="submit"
                    className="formBtn btn-primary bg-blue-500 text-white p-2 rounded-md"
                  >
                    Submit
                  </button>
                </form>
              </div>
              <button
                className="mt-4 bg-red-500 text-white p-2 rounded-md"
                onClick={closeModal} // Close the modal when clicked
              >
                Close
              </button>
            </div>
          </div>
        )}

        <main className="grid grid-cols-4 gap-6">
          <section className="col-span-3">
            <h2 className="font-title text-2xl mb-4">Available Videos</h2>
            <div className="grid grid-cols-4 gap-4">
              {/* Video Cards */}
              {videos.map((video) => (
                <div key={video.id} className="video-card">
                  <iframe
                    id={`iframe-${video.id}`}
                    src={video.videoUrl} // The initial video URL
                    className="w-full h-[150px] object-cover rounded-md mb-4"
                    title={video.channelName}
                    allowFullScreen
                  ></iframe>
                  <h3 className="font-bold text-xl mb-2">{video.channelName}</h3>
                  <button
                    onClick={() => handleVideoClick(video)}
                    disabled={isVideoLocked}
                    className="bg-primary-500 text-primary-50 py-2 px-4 rounded-md mt-auto"
                  >
                    {isVideoLocked ? `Wait ${timeLeft} seconds` : 'Watch & Earn'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar Section */}
          <aside>
            <h2 className="font-title text-2xl mb-4">Points Earned</h2>
            <div className="bg-neutral-800 rounded-md p-4 text-center">
              <p className="text-xl font-bold mb-2">Total Points</p>
              <div className="bg-neutral-900 rounded-full h-[30px] w-full mb-4 relative">
                <div
                  className="bg-primary-500 rounded-full h-[30px] absolute top-0"
                  style={{
                    width: `${Math.min((points / 10) * 100, 100)}%`,
                    height: "20%",
                    borderRadius: 0,
                  }}
                >
                </div>
              </div>
              <p>TT = Total Tokens</p>
              <p className="text-4xl font-title text-primary-500 mb-4">TT: {points}</p>
              <p>Total Money: {money} tk</p>
              <button onClick={handleRedeem} className="bg-primary-500 text-primary-50 px-4 py-2 rounded-md">
                Redeem Points
              </button>
              {isRedeemModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="p-6 rounded-md shadow-lg">
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={handleMobileInput}
                      placeholder="Enter mobile number"
                      style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button onClick={handleNumberSubmit} className="bg-green-500 text-white px-4 py-2 rounded mt-4">Submit</button>
                    <button onClick={closeRedeemModal} className="bg-green-500 text-white px-4 py-2 rounded mt-4">Close</button>
                  </div>
                </div>
              )}
            </div>
            <h1 style={{ color: "#fff" }}>Currently 2TT = 1tk <br />More Signup will increase rate</h1>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default Feed;
