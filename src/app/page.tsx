"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, UserSquare2, Vote, ChevronRight, AlertCircle } from "lucide-react";
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
  const [state, setState] = useState({
    account: null,
    isRegistered: false,
    isAdmin: false,
    isOriginalAdmin: false,
    isLoading: false,
    isCheckingStatus: false,
    error: null
  });

  const checkUserStatus = useCallback(async () => {
    setState(prev => ({...prev, isCheckingStatus: true, error: null}));
    try {
      const accountResult = await getCurrentAccount();
      if (!accountResult.success) {
        setState(prev => ({...prev, account: null, isRegistered: false, isAdmin: false, isOriginalAdmin: false, error: "Failed to get wallet account"}));
        return;
      }
      
      const originalAdminResult = await checkIsOriginalAdmin(accountResult.address);
      const userIsOriginalAdmin = originalAdminResult.success && originalAdminResult.isOriginalAdmin;
      
      if (userIsOriginalAdmin) {
        setState(prev => ({...prev, account: accountResult.address, isRegistered: true, isAdmin: true, isOriginalAdmin: true}));
      } else {
        const registeredResult = await isUserRegistered(accountResult.address);
        const adminResult = await hasAdminRole(accountResult.address);
        setState(prev => ({
          ...prev,
          account: accountResult.address,
          isRegistered: registeredResult.success && registeredResult.isRegistered,
          isAdmin: adminResult.success && adminResult.hasRole
        }));
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      setState(prev => ({...prev, error: "Error checking wallet status"}));
    } finally {
      setState(prev => ({...prev, isCheckingStatus: false}));
    }
  }, []);

  const registerUser = async () => {
    setState(prev => ({...prev, error: null, isLoading: true}));
    try {
      const result = await registerUserFn();
      if (result.success) {
        await checkUserStatus();
        return true;
      }
      setState(prev => ({...prev, error: "Registration failed"}));
      return false;
    } catch (error) {
      console.error("Error registering user:", error);
      setState(prev => ({...prev, error: "Error during registration"}));
      return false;
    } finally {
      setState(prev => ({...prev, isLoading: false}));
    }
  };

  const handleConnect = async () => {
    if (typeof window !== 'undefined' && !window.ethereum) {
      setState(prev => ({...prev, error: "Please install MetaMask or another Ethereum wallet provider"}));
      return;
    }
    
    setState(prev => ({...prev, isLoading: true, error: null}));
    try {
      await initializeProvider();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await checkUserStatus();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setState(prev => ({...prev, error: "Failed to connect wallet"}));
    } finally {
      setState(prev => ({...prev, isLoading: false}));
    }
  };

  useEffect(() => {
    if (!state.isCheckingStatus && state.account && state.isRegistered) {
      router.push(`/dashboard/${state.isAdmin ? 'admin' : 'user'}`);
    }
  }, [state.account, state.isRegistered, state.isAdmin, state.isCheckingStatus, router]);

  const truncateAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "";

  const { account, isRegistered, isAdmin, isLoading, isCheckingStatus, error } = state;

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row shadow-xl rounded-2xl overflow-hidden bg-white">
        
        {/* Left Side - Branding */}
        <div className="lg:w-1/2 bg-gradient-to-br from-emerald-700 to-green-900 p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-white">
          <div className="relative">
            <div className="absolute inset-0 bg-white opacity-10 rounded-full animate-pulse" />
            <div className="rounded-full bg-white bg-opacity-20 p-4 sm:p-6 shadow-lg mb-4 sm:mb-6">
              <Vote className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 sm:mt-6 text-center">Decentralized Voting</h1>
          
          <p className="text-emerald-100 mt-3 sm:mt-4 text-center max-w-md text-base sm:text-lg">
            Secure, transparent, and trustless voting system powered by blockchain technology
          </p>
          
          <div className="mt-6 sm:mt-8 md:mt-10 w-full max-w-md space-y-3 sm:space-y-4">
            {['Tamper-proof ballots', 'Verified voter identity', 'Real-time, transparent results'].map((text, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-1.5 sm:p-2 rounded-full">
                  {[<ShieldCheck key={0} size={18} className="sm:h-5 sm:w-5" />, 
                    <UserSquare2 key={1} size={18} className="sm:h-5 sm:w-5" />, 
                    <ChevronRight key={2} size={18} className="sm:h-5 sm:w-5" />][i]}
                </div>
                <span className="text-sm sm:text-base">{text}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 sm:mt-10 md:mt-12 bg-white bg-opacity-10 p-3 sm:p-4 rounded-lg w-full max-w-md backdrop-blur-sm">
            <p className="text-center italic text-base sm:text-lg">"Vote with confidence, secured and anonymous"</p>
          </div>
        </div>

        {/* Right Side - Auth */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">Login/Register Now</h2>
          
          {error && (
            <div className="w-full max-w-md mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start">
              <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="w-full max-w-md">
            {isLoading || isCheckingStatus ? (
              <div className="flex flex-col items-center py-6 sm:py-8">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping opacity-30 rounded-full bg-emerald-200" style={{animationDuration: "2s"}} />
                  <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-emerald-600" />
                </div>
                <p className="mt-4 sm:mt-6 text-gray-600 text-base sm:text-lg font-medium">
                  {isLoading ? "Connecting to wallet..." : "Checking wallet status..."}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-2">Please confirm any wallet prompts</p>
              </div>
            ) : !account ? (
              <>
                <button 
                  onClick={handleConnect} 
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg mb-3 sm:mb-4 flex items-center justify-center space-x-2"
                >
                  <span className="text-sm sm:text-base">CONNECT WALLET</span>
                  <ChevronRight size={16} className="sm:h-5 sm:w-5" />
                </button>
                <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">MetaMask or Ethereum wallet required</p>
              </>
            ) : !isRegistered ? (
              <>
                <div className="mb-4 sm:mb-6 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center">
                  <UserSquare2 className="text-emerald-600 mr-2 sm:mr-3" size={18} />
                  <div className="font-mono text-sm sm:text-base text-gray-700">{truncateAddress(account)}</div>
                </div>
                
                <div className="mb-6 sm:mb-8 bg-amber-50 border border-amber-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center">
                  <AlertCircle className="text-amber-600 mr-2 sm:mr-3" size={18} />
                  <div className="text-xs sm:text-sm text-amber-800">Wallet connected but not registered</div>
                </div>
                
                <button 
                  onClick={registerUser}
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg mb-3 sm:mb-4 flex items-center justify-center space-x-2"
                >
                  <span className="text-sm sm:text-base">REGISTER NOW</span>
                  <ChevronRight size={16} className="sm:h-5 sm:w-5" />
                </button>
                
                <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">Registration requires a one-time gas fee</p>
              </>
            ) : (
              <div className="flex flex-col items-center py-6 sm:py-8">
                <div className="bg-emerald-100 rounded-full p-4 sm:p-6 mb-4 sm:mb-6 relative">
                  <div className="absolute inset-0 bg-emerald-500 opacity-20 rounded-full animate-pulse" />
                  <ShieldCheck className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-600" />
                </div>
                
                <p className="text-lg sm:text-xl font-medium text-emerald-700">{isAdmin ? "Admin access verified!" : "User verified!"}</p>
                <p className="text-sm sm:text-base text-gray-600 mt-2">Redirecting to {isAdmin ? "admin" : "voter"} dashboard...</p>
                
                <div className="w-full bg-gray-100 h-2 rounded-full mt-6 sm:mt-8">
                  <div className="bg-emerald-500 h-2 rounded-full w-full animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}