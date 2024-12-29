import React from 'react'
import { Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useState } from 'react';

function Signup() {
    
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const signupHelper = async () => {
        setError("");
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        try {
            console.log("Creating user...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User created:", userCredential.user);
        
            console.log("Saving user to Firestore...");
            await setDoc(doc(db, "Users", user.uid), { 
                email: user.email,
                username: username,

            });
            console.log("User saved to Firestore.");
        } catch (err) {
            console.error("Error during signup:", err);
        }
        
    };
    
    return (
        <main className="main-login">
            <div className="left-login">
                <h1>Signup &<br />Trend Your Video</h1>
                <img src="https://i.postimg.cc/YC13sX2Z/Astronaut-cuate.png" className="left-login-img" alt="astronaut image" />
            </div>

            <div className="right-login">
                <div className="card-login">
                    <h1>Signup</h1>
                    <div className="textfield">
                        <label for="user">Email</label>
                        <input type="email" name="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="email" 
                            required />
                    </div>
                    <div className="textfield">
                        <label for="user">Username</label>
                        <input type="text" name="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="username" 
                            required />
                    </div>

                    <div className="textfield">
                        <label for="password">Password</label>
                        <input type="password" name="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                            required />
                    </div>
                    <button className="btn-login" onClick={signupHelper}>Signup</button>
                    <p style={{paddingTop: "16px"}}>Already Have An Account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Signup