// Web3 Configuration
import { ethers } from 'ethers';

export const LinkLockerABI = [
  "event LinkCreated(uint256 indexed linkId, address indexed owner)",
  "event LinkUpdated(uint256 indexed linkId, address indexed owner)",
  "event LinkDeleted(uint256 indexed linkId, address indexed owner)",
  "event LinkShared(uint256 indexed linkId, address indexed sharedWith)",
  "event LinkUnshared(uint256 indexed linkId, address indexed unsharedWith)",

  "function getLink(uint256 _linkId) public view returns (uint256 id, string memory title, string memory url, string memory description, uint8 visibility, address owner, uint256 createdAt, uint256 updatedAt)",
  "function getMyLinks() public view returns (uint256[] memory)",
  "function getSharedWithMe() public view returns (uint256[] memory)",
  "function getPublicLinks() public view returns (uint256[] memory)",
  "function canAccess(uint256 _linkId) public view returns (bool)",
  
  "function createLink(string memory _title, string memory _url, string memory _description, uint8 _visibility, address[] memory _sharedWith) public returns (uint256)",
  "function updateLink(uint256 _linkId, string memory _title, string memory _url, string memory _description, uint8 _visibility) public",
  "function deleteLink(uint256 _linkId) public",
  "function shareLink(uint256 _linkId, address[] memory _addresses) public",
  "function unshareLink(uint256 _linkId, address[] memory _addresses) public"
];

export const networkConfig = {
  chainId: 17000, 
  chainName: "Holesky",
  rpcUrls: ["https://ethereum-holesky.publicnode.com"],
  blockExplorerUrls: ["https://holesky.etherscan.io"],
  nativeCurrency: {
    name: "Holesky Ether",
    symbol: "ETH",
    decimals: 18
  }
};
//Ubah address kontrak di sini
export const CONTRACT_ADDRESS: string = "0x0000000000000000000000000000000000000000";

// Flag untuk menandai bahwa kontrak belum di-deploy
export const isContractDeployed = false;

export enum Visibility {
  Public = 0,
  Private = 1,
  Shared = 2
} 