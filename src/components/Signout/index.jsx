import { signOut } from "firebase/auth";
import { auth } from '../firebase/firebase';

export const signOutUser = async (navigate) => {
    try {
        // Sign out from Firebase
        await signOut(auth);
        
        // Log success message
        console.log("Successfully signed out.");
        
        // Navigate to login page
        navigate("/login");
    } catch (error) {
        // Handle errors more precisely
        if (error.code) {
            console.error(`Firebase Error: ${error.code} - ${error.message}`);
        } else {
            console.error("Error signing out:", error.message);
        }
    }
};
