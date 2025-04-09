// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserAuthentication.sol";

/**
 * @title DecentralizedVoting
 * @dev Contract for conducting decentralized elections with location selection.
 * Registered users, when voting, must select one of the admin-approved locations for that election.
 * Each user can vote for only one candidate per election (though they can vote in multiple elections).
 */
contract DecentralizedVoting {
    UserAuthentication public authContract;

    struct Election {
        uint256 id;
        string name;
        string electionType;
        uint256 startTime;
        uint256 endTime;
        uint256 totalVotes;
        uint256 candidatesCount;
        bool exists;
    }

    struct Candidate {
        uint256 id;
        string name;
        bool exists;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => mapping(string => bool)) public electionLocations; // electionId => location => isValid
    mapping(uint256 => string[]) public electionLocationsList; // electionId => array of valid locations
    mapping(uint256 => mapping(string => uint256)) public locationVotes; // electionId => location => votes
    mapping(uint256 => mapping(address => bool)) public hasVoted; // electionId => user => hasVoted
    mapping(uint256 => mapping(uint256 => uint256)) public candidateVotes; // electionId => candidateId => votes

    uint256 public electionsCount;

    event ElectionCreated(uint256 electionId, string name, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 electionId, address voter, string location);
    event CandidateAdded(uint256 electionId, uint256 candidateId, string name);
    event LocationAdded(uint256 electionId, string location);

    constructor(address _authContractAddress) {
        authContract = UserAuthentication(_authContractAddress);
    }

    modifier onlyAdmin() {
        require(authContract.hasRole(keccak256("ADMIN_ROLE"), msg.sender), "Not an admin");
        _;
    }

    modifier onlyRegisteredUser() {
        require(authContract.isUserRegistered(msg.sender), "Not registered");
        _;
    }

    /**
     * @dev Create a new election with initial locations and candidates in a single transaction.
     * @param _name Name of the election.
     * @param _electionType Type of the election.
     * @param _startTime Start time of the election (unix timestamp).
     * @param _endTime End time of the election (unix timestamp).
     * @param _locations Array of initial valid locations for this election.
     * @param _candidateNames Array of candidate names.
     */
    function createElectionBatch(
        string calldata _name,
        string calldata _electionType,
        uint256 _startTime,
        uint256 _endTime,
        string[] calldata _locations,
        string[] calldata _candidateNames
    ) external onlyAdmin {
        require(_startTime < _endTime, "Invalid time period");

        uint256 electionId = electionsCount++;

        elections[electionId] = Election({
            id: electionId,
            name: _name,
            electionType: _electionType,
            startTime: _startTime,
            endTime: _endTime,
            totalVotes: 0,
            candidatesCount: 0,
            exists: true
        });

        for (uint256 i = 0; i < _locations.length; i++) {
            if (!electionLocations[electionId][_locations[i]]) {
                electionLocations[electionId][_locations[i]] = true;
                electionLocationsList[electionId].push(_locations[i]);
                emit LocationAdded(electionId, _locations[i]);
            }
        }

        for (uint256 j = 0; j < _candidateNames.length; j++) {
            uint256 candidateId = elections[electionId].candidatesCount;
            candidates[electionId][candidateId] = Candidate({
                id: candidateId,
                name: _candidateNames[j],
                exists: true
            });
            elections[electionId].candidatesCount++;
            emit CandidateAdded(electionId, candidateId, _candidateNames[j]);
        }

        emit ElectionCreated(electionId, _name, _startTime, _endTime);
    }

    function addLocationToElection(uint256 _electionId, string calldata _location) external onlyAdmin {
        require(elections[_electionId].exists, "Election does not exist");
        require(block.timestamp < elections[_electionId].startTime, "Election already started");
        require(!electionLocations[_electionId][_location], "Location already added");

        electionLocations[_electionId][_location] = true;
        electionLocationsList[_electionId].push(_location);

        emit LocationAdded(_electionId, _location);
    }

    function addMultipleLocationsToElection(uint256 _electionId, string[] calldata _locations) external onlyAdmin {
        require(elections[_electionId].exists, "Election does not exist");
        require(block.timestamp < elections[_electionId].startTime, "Election already started");

        for (uint256 i = 0; i < _locations.length; i++) {
            if (!electionLocations[_electionId][_locations[i]]) {
                electionLocations[_electionId][_locations[i]] = true;
                electionLocationsList[_electionId].push(_locations[i]);
                emit LocationAdded(_electionId, _locations[i]);
            }
        }
    }

    function addCandidate(uint256 _electionId, string calldata _name) external onlyAdmin {
        require(elections[_electionId].exists, "Election does not exist");
        require(block.timestamp < elections[_electionId].startTime, "Election already started");

        uint256 candidateId = elections[_electionId].candidatesCount;

        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            exists: true
        });

        elections[_electionId].candidatesCount++;

        emit CandidateAdded(_electionId, candidateId, _name);
    }

    function vote(uint256 _electionId, uint256 _candidateId, string calldata _location) external onlyRegisteredUser {
        require(elections[_electionId].exists, "Election does not exist");
        require(candidates[_electionId][_candidateId].exists, "Candidate does not exist");
        require(block.timestamp >= elections[_electionId].startTime, "Election not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election ended");
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");
        require(electionLocations[_electionId][_location], "Invalid location for this election");

        hasVoted[_electionId][msg.sender] = true;
        candidateVotes[_electionId][_candidateId]++;
        locationVotes[_electionId][_location]++;
        elections[_electionId].totalVotes++;

        emit VoteCast(_electionId, msg.sender, _location);
    }

    function getElectionResults(uint256 _electionId) external view returns (uint256 totalVotes) {
        require(elections[_electionId].exists, "Election does not exist");
        require(block.timestamp > elections[_electionId].endTime, "Election not ended yet");

        return elections[_electionId].totalVotes;
    }

    function getCandidateVotes(uint256 _electionId, uint256 _candidateId) external view returns (uint256 votes) {
        require(elections[_electionId].exists, "Election does not exist");
        require(candidates[_electionId][_candidateId].exists, "Candidate does not exist");
        require(block.timestamp > elections[_electionId].endTime, "Election not ended yet");

        return candidateVotes[_electionId][_candidateId];
    }

    function getLocationVotes(uint256 _electionId, string calldata _location) external view returns (uint256 votes) {
        require(elections[_electionId].exists, "Election does not exist");
        require(electionLocations[_electionId][_location], "Invalid location");
        require(block.timestamp > elections[_electionId].endTime, "Election not ended yet");

        return locationVotes[_electionId][_location];
    }

    function isElectionActive(uint256 _electionId) external view returns (bool) {
        require(elections[_electionId].exists, "Election does not exist");

        uint256 currentTime = block.timestamp;
        return currentTime >= elections[_electionId].startTime && currentTime <= elections[_electionId].endTime;
    }

    function getElectionLocations(uint256 _electionId) external view returns (string[] memory) {
        require(elections[_electionId].exists, "Election does not exist");
        return electionLocationsList[_electionId];
    }

    function getCandidatesCount(uint256 _electionId) external view returns (uint256) {
        require(elections[_electionId].exists, "Election does not exist");
        return elections[_electionId].candidatesCount;
    }

    function isLocationValid(uint256 _electionId, string calldata _location) external view returns (bool) {
        require(elections[_electionId].exists, "Election does not exist");
        return electionLocations[_electionId][_location];
    }
}