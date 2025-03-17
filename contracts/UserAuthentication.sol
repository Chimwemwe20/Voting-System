// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title UserAuthentication
 * @dev Contract for user authentication with admin privileges.
 * Users simply register, without selecting a location.
 */
contract UserAuthentication is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct User {
        bool isRegistered;
    }
    
    mapping(address => User) public users;
    
    event UserRegistered(address indexed user);
    event AdminAdded(address indexed admin);
    
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Add another admin.
     * @param newAdmin Address of the new admin.
     */
    function addAdmin(address newAdmin) external onlyRole(ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, newAdmin);
        emit AdminAdded(newAdmin);
    }
    
    /**
     * @dev Register a new user.
     */
    function registerUser() external {
        require(!users[msg.sender].isRegistered, "User already registered");
        
        users[msg.sender] = User({
            isRegistered: true
        });
        
        emit UserRegistered(msg.sender);
    }
    
    /**
     * @dev Check if a user is registered.
     * @param user Address of the user to check.
     * @return bool True if user is registered.
     */
    function isUserRegistered(address user) external view returns (bool) {
        return users[user].isRegistered;
    }
}
