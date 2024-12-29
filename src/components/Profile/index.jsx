import React, { useEffect, useState } from 'react';
import './profile.css';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

function Profile() {
    const [userData, setUserData] = useState(null);
    const [moneyData, setMoneyData] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, "Users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        setUserData(userDocSnap.data());
                    } else {
                        setError("No profile data found.");
                    }

                    const moneyDocRef = doc(db, "MoneyRequest", user.uid);
                    const moneyDocSnap = await getDoc(moneyDocRef);

                    if (moneyDocSnap.exists()) {
                        setMoneyData(moneyDocSnap.data());
                    } else {
                        setError((prevError) => prevError + " No transaction data found.");
                    }
                } catch (err) {
                    console.error("Error fetching profile data:", err);
                    setError("Failed to load profile and money data.");
                }
            } else {
                setError("User not logged in.");
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (!auth.currentUser) {
        return <div>Loading authentication...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!userData || !moneyData) {
        return <div>Loading profile...</div>;
    }

    return (
        <div id="webcrumbs">
            <div className="w-[400px] bg-white rounded-lg shadow-lg p-6">
                <section className="text-center">
                    <div className="w-[100px] h-[100px] mx-auto mb-4">
                        <img
                            src="https://tools-api.webcrumbs.org/image-placeholder/100/100/avatars/1"
                            alt="Profile Avatar"
                            className="object-contain rounded-full"
                        />
                    </div>
                    <h1 className="text-xl font-title text-neutral-950" style={{ fontWeight: "bold" }}>
                        {userData.username}
                    </h1>
                    <p className="text-neutral-950">{userData.email}</p>
                </section>
                <section className="mt-6 flex justify-between items-center bg-neutral-100 rounded-md p-4">
                    <span className="text-neutral-950" style={{ color: "#fff" }}>Requested Money:</span>
                    <span className="text-lg font-semibold text-primary-950">{moneyData.money}</span>
                </section>
            </div>
        </div>
    );
}

export default Profile;
