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
    // Simply perform an initial check on mount.
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
    // No additional event listener registrations here.
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

  // Other functions remain unchanged.
  const createElection = useCallback(async (name, electionType, startTime, endTime, locations) => {
    const result = await contractInteraction.createElection(name, electionType, startTime, endTime, locations);
    return result.success;
  }, []);

  const addLocationToElection = useCallback(async (electionId, location) => {
    const result = await contractInteraction.addLocationToElection(electionId, location);
    return result.success;
  }, []);

  const addCandidate = useCallback(async (electionId, name) => {
    const result = await contractInteraction.addCandidate(electionId, name);
    return result.success;
  }, []);

  const castVote = useCallback(async (electionId, candidateId, location) => {
    const result = await contractInteraction.castVote(electionId, candidateId, location);
    return result.success;
  }, []);

  const getElections = useCallback(async (startIndex = 0, count = 10) => {
    const result = await contractInteraction.getElections(startIndex, count);
    return result.success ? result.elections : [];
  }, []);

  const getElectionDetails = useCallback(async (electionId) => {
    const result = await contractInteraction.getElectionDetails(electionId);
    return result.success ? result.election : null;
  }, []);

  const getElectionLocations = useCallback(async (electionId) => {
    const result = await contractInteraction.getElectionLocations(electionId);
    return result.success ? result.locations : [];
  }, []);

  const getCandidateDetails = useCallback(async (electionId, candidateId) => {
    const result = await contractInteraction.getCandidateDetails(electionId, candidateId);
    return result.success ? result.candidate : null;
  }, []);

  const getCandidatesCount = useCallback(async (electionId) => {
    const result = await contractInteraction.getCandidatesCount(electionId);
    return result.success ? parseInt(result.count) : 0;
  }, []);

  const hasUserVoted = useCallback(async (electionId) => {
    const result = await contractInteraction.hasUserVoted(electionId);
    return result.success ? result.hasVoted : false;
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
    addCandidate,
    castVote,
    getElections,
    getElectionDetails,
    getElectionLocations,
    getCandidateDetails,
    getCandidatesCount,
    hasUserVoted,
    refreshStatus: checkWalletStatus
  };
}
