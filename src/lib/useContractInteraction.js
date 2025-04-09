import { useState, useEffect, useCallback } from 'react';
import * as contractInteraction from './contract-interaction';

export default function useContractInteraction() {
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isContractOwner, setIsContractOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkWalletStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const accountResult = await contractInteraction.getCurrentAccount();
      if (!accountResult.success) {
        setAccount(null);
        setIsRegistered(false);
        setIsAdmin(false);
        setIsContractOwner(false);
        setIsLoading(false);
        return;
      }
      setAccount(accountResult.address);

      const ownerResult = await contractInteraction.isContractOwner(accountResult.address);
      const isOwner = ownerResult.success && ownerResult.isOwner;
      setIsContractOwner(isOwner);

      const registeredResult = await contractInteraction.isUserRegistered(accountResult.address);
      setIsRegistered(registeredResult.success && registeredResult.isRegistered);

      const adminResult = await contractInteraction.hasAdminRole(accountResult.address);
      setIsAdmin((adminResult.success && adminResult.hasRole) || isOwner);
    } catch (error) {
      console.error("Error checking wallet status:", error);
      setAccount(null);
      setIsRegistered(false);
      setIsAdmin(false);
      setIsContractOwner(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Perform an initial check on mount.
    const init = async () => {
      try {
        await contractInteraction.initializeProvider();
        await checkWalletStatus();
      } catch (error) {
        console.error("Error initializing contract interaction:", error);
        setIsLoading(false);
      }
    };

    init();
  }, [checkWalletStatus]);

  const registerUser = useCallback(async () => {
    try {
      const result = await contractInteraction.registerUser();
      if (result.success) {
        await checkWalletStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during registration:", error);
      return false;
    }
  }, [checkWalletStatus]);

  // Updated to align with contract-interaction.js implementation
  const createElection = useCallback(async (name, electionType, startTime, endTime, locations, candidateNames = []) => {
    try {
      // Align with the implementation in contract-interaction.js
      const result = await contractInteraction.createElection(
        name, 
        electionType, 
        startTime, 
        endTime, 
        locations,
        candidateNames
      );
      
      if (!result.success) {
        console.error("Failed to create election:", result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, electionId: result.electionId, tx: result.tx };
    } catch (error) {
      console.error("Error creating election:", error);
      return { success: false, error: error.message || String(error) };
    }
  }, []);

  const addLocationToElection = useCallback(async (electionId, location) => {
    try {
      const result = await contractInteraction.addLocationToElection(electionId, location);
      return result.success;
    } catch (error) {
      console.error("Error adding location to election:", error);
      return false;
    }
  }, []);

  const addMultipleLocationsToElection = useCallback(async (electionId, locations) => {
    try {
      const result = await contractInteraction.addMultipleLocationsToElection(electionId, locations);
      return result.success;
    } catch (error) {
      console.error("Error adding multiple locations to election:", error);
      return false;
    }
  }, []);

  const addCandidate = useCallback(async (electionId, name) => {
    try {
      const result = await contractInteraction.addCandidate(electionId, name);
      return { success: result.success, candidateId: result.candidateId };
    } catch (error) {
      console.error("Error adding candidate:", error);
      return { success: false, error };
    }
  }, []);

  const castVote = useCallback(async (electionId, candidateId, location) => {
    try {
      const result = await contractInteraction.castVote(electionId, candidateId, location);
      return result.success;
    } catch (error) {
      console.error("Error casting vote:", error);
      return false;
    }
  }, []);

  const getElections = useCallback(async (startIndex = 0, count = 10) => {
    try {
      const result = await contractInteraction.getElections(startIndex, count);
      return {
        success: result.success,
        elections: result.success ? result.elections : [],
        totalCount: result.success ? parseInt(result.totalCount) : 0,
        hasMore: result.success ? result.hasMore : false
      };
    } catch (error) {
      console.error("Error getting elections:", error);
      return { success: false, elections: [], totalCount: 0, hasMore: false };
    }
  }, []);

  const getElectionDetails = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.getElectionDetails(electionId);
      return { success: result.success, election: result.success ? result.election : null };
    } catch (error) {
      console.error("Error getting election details:", error);
      return { success: false, election: null };
    }
  }, []);

  const getElectionLocations = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.getElectionLocations(electionId);
      return { success: result.success, locations: result.success ? result.locations : [] };
    } catch (error) {
      console.error("Error getting election locations:", error);
      return { success: false, locations: [] };
    }
  }, []);

  const isLocationValid = useCallback(async (electionId, location) => {
    try {
      const result = await contractInteraction.isLocationValid(electionId, location);
      return { success: result.success, isValid: result.success ? result.isValid : false };
    } catch (error) {
      console.error("Error checking if location is valid:", error);
      return { success: false, isValid: false };
    }
  }, []);

  const getCandidateDetails = useCallback(async (electionId, candidateId) => {
    try {
      const result = await contractInteraction.getCandidateDetails(electionId, candidateId);
      return { success: result.success, candidate: result.success ? result.candidate : null };
    } catch (error) {
      console.error("Error getting candidate details:", error);
      return { success: false, candidate: null };
    }
  }, []);

  const getAllCandidatesForElection = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.getAllCandidatesForElection(electionId);
      return { success: result.success, candidates: result.success ? result.candidates : [] };
    } catch (error) {
      console.error("Error getting all candidates for election:", error);
      return { success: false, candidates: [] };
    }
  }, []);

  const getCandidatesCount = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.getCandidatesCount(electionId);
      return { success: result.success, count: result.success ? parseInt(result.count) : 0 };
    } catch (error) {
      console.error("Error getting candidates count:", error);
      return { success: false, count: 0 };
    }
  }, []);

  const hasUserVoted = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.hasUserVoted(electionId);
      return { success: result.success, hasVoted: result.success ? result.hasVoted : false };
    } catch (error) {
      console.error("Error checking if user has voted:", error);
      return { success: false, hasVoted: false };
    }
  }, []);

  const getElectionResults = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.getElectionResults(electionId);
      return { success: result.success, totalVotes: result.success ? parseInt(result.totalVotes) : 0 };
    } catch (error) {
      console.error("Error getting election results:", error);
      return { success: false, totalVotes: 0 };
    }
  }, []);

  const getCandidateVotes = useCallback(async (electionId, candidateId) => {
    try {
      const result = await contractInteraction.getCandidateVotes(electionId, candidateId);
      return { success: result.success, votes: result.success ? parseInt(result.votes) : 0 };
    } catch (error) {
      console.error("Error getting candidate votes:", error);
      return { success: false, votes: 0 };
    }
  }, []);

  const getLocationVotes = useCallback(async (electionId, location) => {
    try {
      const result = await contractInteraction.getLocationVotes(electionId, location);
      return { success: result.success, votes: result.success ? parseInt(result.votes) : 0 };
    } catch (error) {
      console.error("Error getting location votes:", error);
      return { success: false, votes: 0 };
    }
  }, []);

  const getAllLocationVotesForElection = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.getAllLocationVotesForElection(electionId);
      return { success: result.success, locationVotes: result.success ? result.locationVotes : [] };
    } catch (error) {
      console.error("Error getting all location votes for election:", error);
      return { success: false, locationVotes: [] };
    }
  }, []);

  const getAllCandidateVotesForElection = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.getAllCandidateVotesForElection(electionId);
      return { success: result.success, candidateVotes: result.success ? result.candidateVotes : [] };
    } catch (error) {
      console.error("Error getting all candidate votes for election:", error);
      return { success: false, candidateVotes: [] };
    }
  }, []);

  const isElectionActive = useCallback(async (electionId) => {
    try {
      const result = await contractInteraction.isElectionActive(electionId);
      return { success: result.success, isActive: result.success ? result.isActive : false };
    } catch (error) {
      console.error("Error checking if election is active:", error);
      return { success: false, isActive: false };
    }
  }, []);

  // Add new functions that exist in contract-interaction.js
  const getElectionsByIds = useCallback(async (electionIds) => {
    try {
      const result = await contractInteraction.getElectionsByIds(electionIds);
      return { success: result.success, elections: result.success ? result.elections : [] };
    } catch (error) {
      console.error("Error getting elections by IDs:", error);
      return { success: false, elections: [] };
    }
  }, []);

  const getElectionsCount = useCallback(async () => {
    try {
      const result = await contractInteraction.getElectionsCount();
      return { success: result.success, count: result.success ? parseInt(result.count) : 0 };
    } catch (error) {
      console.error("Error getting elections count:", error);
      return { success: false, count: 0 };
    }
  }, []);

  const resetCache = useCallback(() => {
    return contractInteraction.resetCache();
  }, []);

  return {
    account,
    isRegistered,
    isAdmin,
    isContractOwner,
    isLoading,
    registerUser,
    createElection,
    addLocationToElection,
    addMultipleLocationsToElection,
    addCandidate,
    castVote,
    getElections,
    getElectionDetails,
    getElectionLocations,
    isLocationValid,
    getCandidateDetails,
    getAllCandidatesForElection,
    getCandidatesCount,
    hasUserVoted,
    getElectionResults,
    getCandidateVotes,
    getLocationVotes,
    getAllLocationVotesForElection,
    getAllCandidateVotesForElection,
    isElectionActive,
    getElectionsByIds,
    getElectionsCount,
    resetCache,
    refreshStatus: checkWalletStatus
  };
}