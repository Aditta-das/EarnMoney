import * as React from 'react';
import './login.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase/firebase';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Check if the user is already logged in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/feed"); // Redirect to the feed page if authenticated
            }
        });

        return () => unsubscribe(); // Cleanup the subscription
    }, [navigate]);

    const loginHelper = async () => {
        setError(""); // Clear previous errors
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            const userCreds = await signInWithEmailAndPassword(auth, email, password);
            const user = userCreds.user;
            console.log("Logged in user:", user);
            navigate("/feed"); // Redirect to the feed page after successful login
        } catch (err) {
            console.error("Error during login:", err.message);
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <main className="main-login">
            <div className="left-login">
                <h1>Login &<br/>Trend Your Video</h1>
                <img 
                    src="https://i.postimg.cc/YC13sX2Z/Astronaut-cuate.png" 
                    className="left-login-img" 
                    alt="astronaut image" 
                />
            </div>

            <div className="right-login">
                <div className="card-login">
                    <h1>Login</h1>

                    {/* Error message display */}
                    {error && <p className="error-message">{error}</p>}

                    <div className="textfield">
                        <label htmlFor="user">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            required
                        />
                    </div>

                    <div className="textfield">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                            required
                        />
                    </div>

                    <button className="btn-login" onClick={loginHelper}>Login</button>
                    <p style={{paddingTop: "16px"}}>Don't Have An Account? <Link to="/signup">Signup</Link></p>
                </div>
            </div>
        </main>
    );
}

export default Login;
