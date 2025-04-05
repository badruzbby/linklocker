// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LinkLocker {
    enum Visibility { Public, Private, Shared }

    struct Link {
        uint256 id;
        string title;
        string url;
        string description;
        Visibility visibility;
        address owner;
        address[] sharedWith;
        bool exists;
        uint256 createdAt;
        uint256 updatedAt;
    }

    uint256 private linkCount;
    mapping(uint256 => Link) private links;
    mapping(address => uint256[]) private ownerToLinkIds;
    mapping(address => uint256[]) private sharedToLinkIds;

    event LinkCreated(uint256 indexed linkId, address indexed owner);
    event LinkUpdated(uint256 indexed linkId, address indexed owner);
    event LinkDeleted(uint256 indexed linkId, address indexed owner);
    event LinkShared(uint256 indexed linkId, address indexed sharedWith);
    event LinkUnshared(uint256 indexed linkId, address indexed unsharedWith);

    modifier onlyLinkOwner(uint256 _linkId) {
        require(links[_linkId].exists, "Link does not exist");
        require(links[_linkId].owner == msg.sender, "Not the link owner");
        _;
    }

    modifier linkExists(uint256 _linkId) {
        require(links[_linkId].exists, "Link does not exist");
        _;
    }

    modifier canAccessLink(uint256 _linkId) {
        require(links[_linkId].exists, "Link does not exist");
        require(
            links[_linkId].visibility == Visibility.Public || 
            links[_linkId].owner == msg.sender || 
            isSharedWith(_linkId, msg.sender),
            "Not authorized to access this link"
        );
        _;
    }

    function isSharedWith(uint256 _linkId, address _user) internal view returns (bool) {
        for (uint256 i = 0; i < links[_linkId].sharedWith.length; i++) {
            if (links[_linkId].sharedWith[i] == _user) {
                return true;
            }
        }
        return false;
    }

    function createLink(
        string memory _title, 
        string memory _url, 
        string memory _description, 
        Visibility _visibility, 
        address[] memory _sharedWith
    ) public returns (uint256) {
        linkCount++;
        uint256 newLinkId = linkCount;
        
        Link storage newLink = links[newLinkId];
        newLink.id = newLinkId;
        newLink.title = _title;
        newLink.url = _url;
        newLink.description = _description;
        newLink.visibility = _visibility;
        newLink.owner = msg.sender;
        newLink.exists = true;
        newLink.createdAt = block.timestamp;
        newLink.updatedAt = block.timestamp;
        
        if (_visibility == Visibility.Shared) {
            for (uint256 i = 0; i < _sharedWith.length; i++) {
                newLink.sharedWith.push(_sharedWith[i]);
                sharedToLinkIds[_sharedWith[i]].push(newLinkId);
                emit LinkShared(newLinkId, _sharedWith[i]);
            }
        }
        
        ownerToLinkIds[msg.sender].push(newLinkId);
        
        emit LinkCreated(newLinkId, msg.sender);
        return newLinkId;
    }

    function updateLink(
        uint256 _linkId,
        string memory _title,
        string memory _url,
        string memory _description,
        Visibility _visibility
    ) public onlyLinkOwner(_linkId) {
        Link storage linkToUpdate = links[_linkId];
        
        linkToUpdate.title = _title;
        linkToUpdate.url = _url;
        linkToUpdate.description = _description;
        linkToUpdate.visibility = _visibility;
        linkToUpdate.updatedAt = block.timestamp;
        
        emit LinkUpdated(_linkId, msg.sender);
    }

    function deleteLink(uint256 _linkId) public onlyLinkOwner(_linkId) {
        uint256[] storage ownerLinks = ownerToLinkIds[msg.sender];
        for (uint256 i = 0; i < ownerLinks.length; i++) {
            if (ownerLinks[i] == _linkId) {
                ownerLinks[i] = ownerLinks[ownerLinks.length - 1];
                ownerLinks.pop();
                break;
            }
        }
        
        for (uint256 i = 0; i < links[_linkId].sharedWith.length; i++) {
            address sharedAddress = links[_linkId].sharedWith[i];
            uint256[] storage sharedLinks = sharedToLinkIds[sharedAddress];
            
            for (uint256 j = 0; j < sharedLinks.length; j++) {
                if (sharedLinks[j] == _linkId) {
                    sharedLinks[j] = sharedLinks[sharedLinks.length - 1];
                    sharedLinks.pop();
                    break;
                }
            }
        }
        
        delete links[_linkId];
        
        emit LinkDeleted(_linkId, msg.sender);
    }

    function shareLink(uint256 _linkId, address[] memory _addresses) public onlyLinkOwner(_linkId) {
        require(links[_linkId].visibility == Visibility.Shared, "Link must be set to Shared visibility");
        
        for (uint256 i = 0; i < _addresses.length; i++) {
            address shareWith = _addresses[i];
            
            if (!isSharedWith(_linkId, shareWith)) {
                links[_linkId].sharedWith.push(shareWith);
                sharedToLinkIds[shareWith].push(_linkId);
                emit LinkShared(_linkId, shareWith);
            }
        }
    }

    function unshareLink(uint256 _linkId, address[] memory _addresses) public onlyLinkOwner(_linkId) {
        for (uint256 i = 0; i < _addresses.length; i++) {
            address unshareWith = _addresses[i];
            
            Link storage link = links[_linkId];
            for (uint256 j = 0; j < link.sharedWith.length; j++) {
                if (link.sharedWith[j] == unshareWith) {
                    link.sharedWith[j] = link.sharedWith[link.sharedWith.length - 1];
                    link.sharedWith.pop();
                    
                    uint256[] storage sharedLinks = sharedToLinkIds[unshareWith];
                    for (uint256 k = 0; k < sharedLinks.length; k++) {
                        if (sharedLinks[k] == _linkId) {
                            sharedLinks[k] = sharedLinks[sharedLinks.length - 1];
                            sharedLinks.pop();
                            break;
                        }
                    }
                    
                    emit LinkUnshared(_linkId, unshareWith);
                    break;
                }
            }
        }
    }

    function getLink(uint256 _linkId) public view canAccessLink(_linkId) returns (
        uint256 id,
        string memory title,
        string memory url,
        string memory description,
        Visibility visibility,
        address owner,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        Link storage link = links[_linkId];
        return (
            link.id,
            link.title,
            link.url,
            link.description,
            link.visibility,
            link.owner,
            link.createdAt,
            link.updatedAt
        );
    }

    function getMyLinks() public view returns (uint256[] memory) {
        return ownerToLinkIds[msg.sender];
    }
    
    function getSharedWithMe() public view returns (uint256[] memory) {
        return sharedToLinkIds[msg.sender];
    }
    
    function getPublicLinks() public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= linkCount; i++) {
            if (links[i].exists && links[i].visibility == Visibility.Public) {
                count++;
            }
        }
        
        uint256[] memory publicLinkIds = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= linkCount; i++) {
            if (links[i].exists && links[i].visibility == Visibility.Public) {
                publicLinkIds[index] = i;
                index++;
            }
        }
        
        return publicLinkIds;
    }
    
    function canAccess(uint256 _linkId) public view returns (bool) {
        if (!links[_linkId].exists) {
            return false;
        }
        
        return (
            links[_linkId].visibility == Visibility.Public || 
            links[_linkId].owner == msg.sender || 
            isSharedWith(_linkId, msg.sender)
        );
    }
} 