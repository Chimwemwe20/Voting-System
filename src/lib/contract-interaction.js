import { ethers } from 'ethers';

// Import ABIs
import UserAuthenticationABI from '../artifacts/contracts/UserAuthenticationABI';
import DecentralizedVotingABI from '../artifacts/contracts/DecentralizedVotingABI';

// Contract addresses from environment variables
const userAuthAddress = process.env.NEXT_PUBLIC_USER_AUTHENTICATION_ADDRESS;
const votingAddress = process.env.NEXT_PUBLIC_DECENTRALIZED_VOTING_ADDRESS;

// Cache for provider, signer and contract instances
let providerInstance = null;
let signerInstance = null;
let userAuthContract = null;
let votingContract = null;
let userAuthWithSigner = null;
let votingWithSigner = null;

// Flag to ensure event listeners are attached only once
let eventListenersAttached = false;

export const initializeProvider = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    providerInstance = new ethers.BrowserProvider(window.ethereum);
    
    if (!eventListenersAttached) {
      // Define stable event listener callbacks
      const handleAccountsChanged = async (accounts) => {
        if (accounts && accounts.length > 0) {
          try {
            signerInstance = null; // Force re-fetch signer
            await getSigner();
          } catch (error) {
            console.error("Error reinitializing signer on accountsChanged:", error);
          }
        } else {
          // No accounts available; clear cached instances.
          signerInstance = null;
          userAuthWithSigner = null;
          votingWithSigner = null;
        }
      };
      
      const handleChainChanged = async () => {
        providerInstance = new ethers.BrowserProvider(window.ethereum);
        try {
          signerInstance = null;
          userAuthContract = null;
          votingContract = null;
          userAuthWithSigner = null;
          votingWithSigner = null;
          await getSigner();
        } catch (error) {
          console.error("Error reinitializing signer on chainChanged:", error);
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      eventListenersAttached = true;
    }
    
    return true;
  }
  return false;
};

const getProvider = async () => {
  if (!providerInstance && typeof window !== 'undefined' && window.ethereum) {
    providerInstance = new ethers.BrowserProvider(window.ethereum);
  }
  if (!providerInstance) {
    throw new Error('Ethereum wallet not detected');
  }
  return providerInstance;
};

const getSigner = async () => {
  if (!signerInstance) {
    const provider = await getProvider();
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    signerInstance = await provider.getSigner();
  }
  return signerInstance;
};

const getUserAuthContract = async () => {
  if (!userAuthContract) {
    const provider = await getProvider();
    userAuthContract = new ethers.Contract(
      userAuthAddress,
      UserAuthenticationABI,
      provider
    );
  }
  return userAuthContract;
};

const getVotingContract = async () => {
  if (!votingContract) {
    const provider = await getProvider();
    votingContract = new ethers.Contract(
      votingAddress,
      DecentralizedVotingABI,
      provider
    );
  }
  return votingContract;
};

const getUserAuthWithSigner = async () => {
  if (!userAuthWithSigner) {
    const contract = await getUserAuthContract();
    const signer = await getSigner();
    userAuthWithSigner = contract.connect(signer);
  }
  return userAuthWithSigner;
};

const getVotingWithSigner = async () => {
  if (!votingWithSigner) {
    const contract = await getVotingContract();
    const signer = await getSigner();
    votingWithSigner = contract.connect(signer);
  }
  return votingWithSigner;
};

// UserAuthentication Contract Functions

export const registerUser = async () => {
  try {
    const contract = await getUserAuthWithSigner();
    const tx = await contract.registerUser();
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error };
  }
};

export const isUserRegistered = async (address) => {
  try {
    const contract = await getUserAuthContract();
    const isRegistered = await contract.isUserRegistered(address);
    return { success: true, isRegistered };
  } catch (error) {
    console.error("Error checking if user is registered:", error);
    return { success: false, error };
  }
};

export const addAdmin = async (newAdminAddress) => {
  try {
    const contract = await getUserAuthWithSigner();
    const tx = await contract.addAdmin(newAdminAddress);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error("Error adding admin:", error);
    return { success: false, error };
  }
};

export const hasAdminRole = async (address) => {
  try {
    const contract = await getUserAuthContract();
    const adminRole = await contract.ADMIN_ROLE();
    const hasRole = await contract.hasRole(adminRole, address);
    return { success: true, hasRole };
  } catch (error) {
    console.error("Error checking admin role:", error);
    return { success: false, error };
  }
};

/**
 * Check if the given address is the original admin (contract deployer).
 * The deployer address must be set in NEXT_PUBLIC_DEPLOYER_ADDRESS.
 */
export const isOriginalAdmin = async (address) => {
  try {
    const deployerAddress = process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS;
    if (!deployerAddress) {
      throw new Error("Deployer address not set in environment");
    }
    return { success: true, isOriginalAdmin: address.toLowerCase() === deployerAddress.toLowerCase() };
  } catch (error) {
    console.error("Error checking if address is original admin:", error);
    return { success: false, error };
  }
};

/**
 * Check if the given address is the contract owner (deployer).
 */
export const isContractOwner = async (address) => {
  try {
    const deployerAddress = process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS;
    if (!deployerAddress) {
      throw new Error("Deployer address not set in environment");
    }
    return { success: true, isOwner: address.toLowerCase() === deployerAddress.toLowerCase() };
  } catch (error) {
    console.error("Error checking if address is contract owner:", error);
    return { success: false, error };
  }
};

// DecentralizedVoting Contract Functions
// ... (Remaining functions remain unchanged)


// DecentralizedVoting Contract Functions

export const createElection = async (name, electionType, startTime, endTime, locations) => {
  try {
    const contract = await getVotingWithSigner();
    const tx = await contract.createElection(name, electionType, startTime, endTime, locations);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error("Error creating election:", error);
    return { success: false, error };
  }
};

export const addLocationToElection = async (electionId, location) => {
  try {
    const contract = await getVotingWithSigner();
    const tx = await contract.addLocationToElection(electionId, location);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error("Error adding location to election:", error);
    return { success: false, error };
  }
};

export const addMultipleLocationsToElection = async (electionId, locations) => {
  try {
    const contract = await getVotingWithSigner();
    const tx = await contract.addMultipleLocationsToElection(electionId, locations);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error("Error adding multiple locations to election:", error);
    return { success: false, error };
  }
};

export const addCandidate = async (electionId, name) => {
  try {
    const contract = await getVotingWithSigner();
    const tx = await contract.addCandidate(electionId, name);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error("Error adding candidate:", error);
    return { success: false, error };
  }
};

export const castVote = async (electionId, candidateId, location) => {
  try {
    const contract = await getVotingWithSigner();
    const tx = await contract.vote(electionId, candidateId, location);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error("Error casting vote:", error);
    return { success: false, error };
  }
};

export const getElectionResults = async (electionId) => {
  try {
    const contract = await getVotingContract();
    const totalVotes = await contract.getElectionResults(electionId);
    return { success: true, totalVotes: totalVotes.toString() };
  } catch (error) {
    console.error("Error getting election results:", error);
    return { success: false, error };
  }
};

export const getCandidateVotes = async (electionId, candidateId) => {
  try {
    const contract = await getVotingContract();
    const votes = await contract.getCandidateVotes(electionId, candidateId);
    return { success: true, votes: votes.toString() };
  } catch (error) {
    console.error("Error getting candidate votes:", error);
    return { success: false, error };
  }
};

export const getLocationVotes = async (electionId, location) => {
  try {
    const contract = await getVotingContract();
    const votes = await contract.getLocationVotes(electionId, location);
    return { success: true, votes: votes.toString() };
  } catch (error) {
    console.error("Error getting location votes:", error);
    return { success: false, error };
  }
};

export const isElectionActive = async (electionId) => {
  try {
    const contract = await getVotingContract();
    const isActive = await contract.isElectionActive(electionId);
    return { success: true, isActive };
  } catch (error) {
    console.error("Error checking if election is active:", error);
    return { success: false, error };
  }
};

export const getElectionLocations = async (electionId) => {
  try {
    const contract = await getVotingContract();
    const locations = await contract.getElectionLocations(electionId);
    return { success: true, locations };
  } catch (error) {
    console.error("Error getting election locations:", error);
    return { success: false, error };
  }
};

export const getCandidatesCount = async (electionId) => {
  try {
    const contract = await getVotingContract();
    const count = await contract.getCandidatesCount(electionId);
    return { success: true, count: count.toString() };
  } catch (error) {
    console.error("Error getting candidates count:", error);
    return { success: false, error };
  }
};

export const isLocationValid = async (electionId, location) => {
  try {
    const contract = await getVotingContract();
    const isValid = await contract.isLocationValid(electionId, location);
    return { success: true, isValid };
  } catch (error) {
    console.error("Error checking if location is valid:", error);
    return { success: false, error };
  }
};

export const getElectionDetails = async (electionId) => {
  try {
    const contract = await getVotingContract();
    const election = await contract.elections(electionId);
    return { 
      success: true, 
      election: {
        id: election.id.toString(),
        name: election.name,
        electionType: election.electionType,
        startTime: election.startTime.toString(),
        endTime: election.endTime.toString(),
        totalVotes: election.totalVotes.toString(),
        candidatesCount: election.candidatesCount.toString(),
        exists: election.exists
      }
    };
  } catch (error) {
    console.error("Error fetching election details:", error);
    return { success: false, error };
  }
};

export const getCandidateDetails = async (electionId, candidateId) => {
  try {
    const contract = await getVotingContract();
    const candidate = await contract.candidates(electionId, candidateId);
    return { 
      success: true, 
      candidate: {
        id: candidate.id.toString(),
        name: candidate.name,
        exists: candidate.exists
      }
    };
  } catch (error) {
    console.error("Error fetching candidate details:", error);
    return { success: false, error };
  }
};

export const getElections = async (startIndex = 0, count = 10) => {
  try {
    const contract = await getVotingContract();
    const electionsCount = await contract.electionsCount();
    
    const endIndex = Math.min(startIndex + count, electionsCount.toNumber());
    const elections = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      const election = await contract.elections(i);
      if (election.exists) {
        elections.push({
          id: election.id.toString(),
          name: election.name,
          electionType: election.electionType,
          startTime: election.startTime.toString(),
          endTime: election.endTime.toString(),
          totalVotes: election.totalVotes.toString(),
          candidatesCount: election.candidatesCount.toString()
        });
      }
    }
    
    return { 
      success: true, 
      elections,
      totalCount: electionsCount.toString(),
      hasMore: endIndex < electionsCount.toNumber()
    };
  } catch (error) {
    console.error("Error fetching elections:", error);
    return { success: false, error };
  }
};

export const getElectionsByIds = async (electionIds) => {
  try {
    const contract = await getVotingContract();
    const promises = electionIds.map(id => contract.elections(id));
    const electionResults = await Promise.all(promises);
    const elections = electionResults
      .filter(election => election.exists)
      .map(election => ({
        id: election.id.toString(),
        name: election.name,
        electionType: election.electionType,
        startTime: election.startTime.toString(),
        endTime: election.endTime.toString(),
        totalVotes: election.totalVotes.toString(),
        candidatesCount: election.candidatesCount.toString()
      }));
    
    return { success: true, elections };
  } catch (error) {
    console.error("Error batch fetching elections:", error);
    return { success: false, error };
  }
};

export const hasUserVoted = async (electionId, userAddress = null) => {
  try {
    const contract = await getVotingContract();
    const address = userAddress || (await getSigner()).address;
    const hasVoted = await contract.hasVoted(electionId, address);
    return { success: true, hasVoted };
  } catch (error) {
    console.error("Error checking if user has voted:", error);
    return { success: false, error };
  }
};

export const getCurrentAccount = async () => {
  try {
    const signer = await getSigner();
    const address = await signer.getAddress();
    return { success: true, address };
  } catch (error) {
    console.error("Error getting current account:", error);
    return { success: false, error };
  }
};

export const getElectionsCount = async () => {
  try {
    const contract = await getVotingContract();
    const count = await contract.electionsCount();
    return { success: true, count: count.toString() };
  } catch (error) {
    console.error("Error getting elections count:", error);
    return { success: false, error };
  }
};

export const resetCache = () => {
  providerInstance = null;
  signerInstance = null;
  userAuthContract = null;
  votingContract = null;
  userAuthWithSigner = null;
  votingWithSigner = null;
  return true;
};

export const getEthereumProvider = getProvider;
export const getEthereumSigner = getSigner;
