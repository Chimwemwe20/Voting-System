"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { 
  initializeProvider, 
  getCurrentAccount, 
  isUserRegistered, 
  hasAdminRole,
  isOriginalAdmin as checkIsOriginalAdmin,
  registerUser as registerUserFn
} from "@/lib/contract-interaction";

export default function ConnectPage() {
  const router = useRouter();
  
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOriginalAdmin, setIsOriginalAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Using useCallback to make the function stable.
  const checkUserStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Initialize provider (which attaches listeners once)
      await initializeProvider();
      
      // Get current account
      const accountResult = await getCurrentAccount();
      if (!accountResult.success) {
        setAccount(null);
        setIsRegistered(false);
        setIsAdmin(false);
        setIsOriginalAdmin(false);
        setIsLoading(false);
        return;
      }
      
      setAccount(accountResult.address);
      
      // Check if user is the original admin (contract deployer)
      const originalAdminResult = await checkIsOriginalAdmin(accountResult.address);
      const userIsOriginalAdmin = originalAdminResult.success && originalAdminResult.isOriginalAdmin;
      setIsOriginalAdmin(userIsOriginalAdmin);
      
      if (userIsOriginalAdmin) {
        setIsRegistered(true);
        setIsAdmin(true);
      } else {
        const registeredResult = await isUserRegistered(accountResult.address);
        setIsRegistered(registeredResult.success && registeredResult.isRegistered);
        
        const adminResult = await hasAdminRole(accountResult.address);
        setIsAdmin(adminResult.success && adminResult.hasRole);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerUser = async () => {
    try {
      const result = await registerUserFn();
      if (result.success) {
        await checkUserStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error registering user:", error);
      return false;
    }
  };

  // Instead of adding event listeners here, we rely on the ones attached in contract-interaction.js.
  useEffect(() => {
    // Initial status check on mount.
    checkUserStatus();
  }, [checkUserStatus]);

  useEffect(() => {
    if (!isLoading && account) {
      if (isRegistered) {
        if (isAdmin) {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/user");
        }
      }
    }
  }, [account, isRegistered, isAdmin, isLoading, router]);

  const handleConnect = async () => {
    if (typeof window !== 'undefined' && !window.ethereum) {
      alert("Please install MetaMask or another Ethereum wallet provider");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await checkUserStatus();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleRegister = async () => {
    try {
      const success = await registerUser();
      if (!success) {
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-green-50">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-green-900">
          Welcome to Decentralized Voting
        </h1>
        <p className="mt-2 text-gray-600">
          Connect your wallet to manage or participate in elections.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="mt-2 text-gray-600">Loading wallet status...</p>
        </div>
      ) : !account ? (
        <Button onClick={handleConnect} className="bg-green-600 hover:bg-green-700">
          Connect Wallet
        </Button>
      ) : !isRegistered ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600">Wallet connected but not registered.</p>
          <Button 
            onClick={handleRegister}
            className="bg-green-600 hover:bg-green-700"
          >
            Register
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="mt-2 text-gray-600">
            Redirecting to {isAdmin ? "admin" : "user"} dashboard...
          </p>
        </div>
      )}
    </div>
  );
}
