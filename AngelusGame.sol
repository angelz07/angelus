// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./AngelusToken.sol";

contract AngelusGame is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    AngelusToken private angelusToken;

    uint256 public newUserBonus = 1000;
    uint256 private _angelusInflationRate;
    uint256 private parcelIdCounter; // Ajouté pour suivre les identifiants de parcelle

    uint256 public rewardRate = 5000; // 5% de récompense initiale, représenté en base 10^5 (5000 = 5%)
    uint256 public rewardAdjustmentFactor = 1000; // Facteur d'ajustement de la récompense en fonction de l'inflation ou de la déflation, représenté en base 10^5 (1000 = 1%)

    constructor(uint256 initialSupply, uint256 angelusInflationRate, address angelusTokenAddress) {
        angelusToken = AngelusToken(angelusTokenAddress);
        angelusToken.setGameContract(address(this));
        angelusToken.mint(msg.sender, calculateAmountToSend(initialSupply));
        _angelusInflationRate = angelusInflationRate;
        parcelIdCounter = 1;

        // Ajoutez les outils
        tools.push(Tool({
            id: 0,
            name: "Hache simple",
            cuttingSpeed: 38,
            speedBonus: 0,
            price: 0
        }));
        tools.push(Tool({
            id: 1,
            name: "Hache de luxe",
            cuttingSpeed: 900 / 20, // À déterminer
            speedBonus: 0,
            price: 10 // À déterminer
        }));
        tools.push(Tool({
            id: 2,
            name: "Tronconneuse Electrique",
            cuttingSpeed: 900 / 15,
            speedBonus: 0,
            price: 20
        }));
        tools.push(Tool({
            id: 3,
            name: "Tronconneuse Essence",
            cuttingSpeed: 900 / 10,
            speedBonus: 0,
            price: 40
        }));
        tools.push(Tool({
            id: 4,
            name: "Tronconneuse Essence Deluxe",
            cuttingSpeed: 112,
            speedBonus: 0,
            price: 60
        }));
        tools.push(Tool({
            id: 5,
            name: "Tracteur Abateuse",
            cuttingSpeed: 900 / 4,
            speedBonus: 0,
            price: 150
        }));

        // Ajoutez les améliorations de vitesse
        speedUpgrades.push(SpeedUpgrade({
            id: 0,
            name: "Vitesse X 2",
            speedMultiplier: 2,
            price: 20 
        }));
        speedUpgrades.push(SpeedUpgrade({
            id: 1,
            name: "Vitesse X 4",
            speedMultiplier: 4,
            price: 40 
        }));
        speedUpgrades.push(SpeedUpgrade({
            id: 2,
            name: "Vitesse X 6",
            speedMultiplier: 6,
            price: 60 
        }));
        speedUpgrades.push(SpeedUpgrade({
            id: 3,
            name: "Vitesse X 8",
            speedMultiplier: 8,
            price: 100 
        }));
        // Ajoutez les améliorations de vitesse de repousse
        reforestationUpgrades.push(ReforestationUpgrade({
            id: 0,
            name: "Vitesse X 2",
            reforestationMultiplier: 2,
            price: 20 
        }));
        reforestationUpgrades.push(ReforestationUpgrade({
            id: 1,
            name: "Vitesse X 4",
            reforestationMultiplier: 4,
            price: 40 
        }));
        reforestationUpgrades.push(ReforestationUpgrade({
            id: 2,
            name: "Vitesse X 6",
            reforestationMultiplier: 6,
            price: 60 
        }));
        reforestationUpgrades.push(ReforestationUpgrade({
            id: 3,
            name: "Vitesse X 8",
            reforestationMultiplier: 8,
            price: 80
        }));
    }

    function calculateAmountToSend(uint256 amount) public pure returns (uint256) {
        uint256 decimals = 18;
        return amount.mul(10**decimals);
    }

    mapping(address => Player) public players;
    mapping(address => Parcel[]) public parcels;
    mapping(address => bool) public isRegistered;
    mapping(bytes32 => address) public nameToAddress;
    mapping(address => Tool[]) public playerTools;

    address[] public registeredPlayers;
    uint256 private toolIdCounter;

    struct Player {
        bytes32 name;
        uint256 registrationTime;
        uint256 cutTrees;
        uint256 angelusBalance;
        uint256 stakedAngelus;
        uint256 unclaimedRewards;
        uint256 lastUpdateTimeClaimRewards;
        uint256 toolId;
        uint256 reforestationUpgradeId;
    }

    struct Parcel {
        bytes32 id;
        string name;
        uint256 trees;
        uint256 maxTrees;
        uint256 lastCutTime;
        uint256 lastGrowthTime;
        uint256 timeUntilCut;
        uint256 timeReforestation;
    }

    struct ParcelInfo {
        bytes32 id;
        string name;
        uint256 trees;
        uint256 maxTrees;
        uint256 lastCutTime;
        uint256 lastGrowthTime;
        uint256 timeUntilCut;
        uint256 timeReforestation;
    }

    // Définissez les structures
    struct Tool {
        uint256 id;
        string name;
        uint256 cuttingSpeed;
        uint256 speedBonus;
        uint256 price;
    }

    struct SpeedUpgrade {
        uint256 id;
        string name;
        uint256 speedMultiplier;
        uint256 price;
    }

    struct ReforestationUpgrade {
        uint256 id;
        string name;
        uint256 reforestationMultiplier;
        uint256 price;
    }

    // Créez des tableaux pour stocker les outils, les améliorations de vitesse et les améliorations de vitesse de repousse
    Tool[] public tools;
    SpeedUpgrade[] public speedUpgrades;
    ReforestationUpgrade[] public reforestationUpgrades;

    event Registration(address indexed playerAddress, bytes32 playerName);
    event TreesCut(address player, uint256 parcelIndex, uint256 trees);
    event ParcelCreated(bytes32 indexed parcelId, string indexed parcelName);

    modifier onlyRegistered {
        require(isRegistered[msg.sender], "Not registered");
        _;
    }

    function register(bytes32 name) external nonReentrant {
        require(nameToAddress[name] == address(0), "Name already taken");
        require(!isRegistered[msg.sender], "Already registered");

        uint256 userAngelusBalance = angelusToken.balanceOf(msg.sender);
        uint256 totalAngelusBalance = userAngelusBalance.add(calculateAmountToSend(newUserBonus));

        Player memory player = Player({
            name: name,
            registrationTime: block.timestamp,
            cutTrees: 0,
            angelusBalance: totalAngelusBalance,
            stakedAngelus: 0,
            unclaimedRewards: 0,
            lastUpdateTimeClaimRewards: block.timestamp,
            toolId: 0, // Hache simple par défaut
            reforestationUpgradeId: 0 // Pas d'amélioration de vitesse de repousse par défaut
        });

        uint256 timeReforestation = 0.02 * 1 hours;
        Parcel memory parcel = Parcel({
            id: keccak256(abi.encodePacked(block.timestamp, msg.sender)),
            name: generateRandomName(parcelIdCounter),
            trees: 900,
            maxTrees: 900,
            lastCutTime: block.timestamp,
            lastGrowthTime: block.timestamp,
            timeUntilCut: block.timestamp,
            timeReforestation: timeReforestation
        });
        parcelIdCounter = parcelIdCounter.add(1);

        isRegistered[msg.sender] = true;
        players[msg.sender] = player;
        parcels[msg.sender].push(parcel);
        nameToAddress[name] = msg.sender;
        registeredPlayers.push(msg.sender);

        angelusToken.mint(msg.sender, calculateAmountToSend(newUserBonus));
        emit ParcelCreated(parcel.id, parcel.name); // Émet l'événement de création de la parcelle
        emit Registration(msg.sender, name);
    }


    function getParcelIndexById(bytes32 parcelId) internal view returns (uint256) {
        uint256 parcelIndex = 0;
        for (uint256 i = 0; i < parcels[msg.sender].length; i++) {
            if (parcels[msg.sender][i].id == parcelId) {
                parcelIndex = i;
                break;
            }
        }
        return parcelIndex;
    }

    event Debug(string message, uint256 value);
   function cutTrees(bytes32 parcelId) external onlyRegistered {
        uint256 parcelIndex = getParcelIndexById(parcelId);
        require(parcelIndex < parcels[msg.sender].length, "Invalid parcel index");

        Parcel storage parcel = parcels[msg.sender][parcelIndex];
        require(parcel.trees == 900, "Trees must be 900 to cut");
        uint256 timeSinceLastCut = block.timestamp.sub(parcel.lastCutTime);

        if (timeSinceLastCut >= parcel.timeReforestation) {
            uint256 treesToCut = calculateTrees(parcel.timeUntilCut, parcel.timeReforestation, parcel.maxTrees);
            emit Debug("treesToCut", treesToCut);
            uint256 toolSpeed = tools[players[msg.sender].toolId].cuttingSpeed;
            emit Debug("toolSpeed", toolSpeed);
            uint256 toolSpeedBonus = tools[players[msg.sender].toolId].speedBonus;
            emit Debug("toolSpeedBonus", toolSpeedBonus);
            uint256 totalCuttingSpeed = toolSpeed.mul(100 + toolSpeedBonus).div(100);
            emit Debug("totalCuttingSpeed", totalCuttingSpeed);
            uint256 cuttableTrees = totalCuttingSpeed.mul(timeSinceLastCut).div(1 hours);
            emit Debug("cuttableTrees", cuttableTrees);
            uint256 treesActuallyCut = treesToCut > cuttableTrees ? cuttableTrees : treesToCut;
            emit Debug("treesActuallyCut", cuttableTrees);

            parcel.trees = parcel.trees.sub(treesActuallyCut);
            emit Debug("parcel.trees ", parcel.trees );
            parcel.lastCutTime = block.timestamp;
            emit Debug("parcel.lastCutTime", parcel.lastCutTime);
            players[msg.sender].cutTrees = players[msg.sender].cutTrees.add(treesActuallyCut);
            emit Debug("players[msg.sender].cutTrees", players[msg.sender].cutTrees);

            emit TreesCut(msg.sender, parcelIndex, treesActuallyCut);
        } else {
            emit Debug("timeSinceLastCut", timeSinceLastCut);
            emit Debug("parcel.timeReforestation", parcel.timeReforestation);
        }
    }

    
    function getPlayerTools(address player) external view returns (Tool[] memory) {
        return playerTools[player];
    }

    function getPlayerParcels(address player) external view returns (ParcelInfo[] memory) {
        Parcel[] storage playerParcels = parcels[player];
        uint256 parcelCount = playerParcels.length;
        ParcelInfo[] memory parcelInfos = new ParcelInfo[](parcelCount);

        for (uint256 i = 0; i < parcelCount; i++) {
            Parcel storage parcel = playerParcels[i];

            uint256 timeUntilCut;
            uint256 timeSinceLastCut = block.timestamp.sub(parcel.lastCutTime);
            if (timeSinceLastCut >= parcel.timeReforestation) {
                timeUntilCut = 0;
            } else {
                timeUntilCut = parcel.timeReforestation.sub(timeSinceLastCut);
            }

            uint256 trees = calculateTrees(timeUntilCut, parcel.timeReforestation, parcel.maxTrees);

            parcelInfos[i] = ParcelInfo({
                id: parcel.id,
                name: parcel.name,
                trees: trees,
                maxTrees: parcel.maxTrees,
                lastCutTime: parcel.lastCutTime,
                lastGrowthTime: parcel.lastGrowthTime,
                timeUntilCut: timeUntilCut,
                timeReforestation: parcel.timeReforestation
            });
        }

        return parcelInfos;
    }


    function calculateTrees(uint256 timeUntilCut, uint256 timeReforestation, uint256 maxTrees) private pure returns (uint256) {
        if (timeUntilCut == 0) {
            return maxTrees; // Ajouter cette ligne pour mettre en pause la repousse des arbres si timeUntilCut est égal à 0
        }
        uint256 timePassed = timeReforestation.sub(timeUntilCut);
        uint256 trees = maxTrees.mul(timePassed).div(timeReforestation);

        return trees;
    }

    function getPlayerInfo(address playerAddress) external view returns (bytes32, uint256,  uint256, uint256,  uint256, uint256, uint256, uint256, uint256) {
        Player storage player = players[playerAddress];
        return (
            player.name,
            player.registrationTime,
            player.cutTrees,
            player.angelusBalance,
            player.stakedAngelus,
            player.unclaimedRewards,
            player.lastUpdateTimeClaimRewards,
            player.toolId, 
            player.reforestationUpgradeId 
        );
    }
    
    function generateRandomName(uint256 seed) private view returns (string memory) {
        bytes memory letters = "bcdfghjklmnpqrstvwxyz"; // Lettres non-voyelles
        bytes memory vowels = "aeiou";

        bytes memory name = new bytes(16);
        uint256 rand;

        rand = uint256(keccak256(abi.encodePacked(seed, block.timestamp, "consonant"))) % letters.length;
        name[0] = letters[rand];

        rand = uint256(keccak256(abi.encodePacked(seed, block.timestamp, "vowel"))) % vowels.length;
        name[1] = vowels[rand];

        for (uint256 i = 2; i < 15; i++) {
            if (!isVowel(name[i-1]) && !isVowel(name[i-2])) {
                rand = uint256(keccak256(abi.encodePacked(seed, block.timestamp, i, "vowel"))) % vowels.length;
                name[i] = vowels[rand];
            } else {
                rand = uint256(keccak256(abi.encodePacked(seed, block.timestamp, i, "consonant"))) % letters.length;
                name[i] = letters[rand];
            }
        }

        // Supprimer les caractères null-terminator de la fin de la chaîne de caractères
        uint256 index;
        for (index = 14; index > 0; index--) {
            if (name[index] != 0x00) {
                break;
            }
        }

        bytes memory trimmedName = new bytes(index + 1);
        for (uint256 i = 0; i <= index; i++) {
            trimmedName[i] = name[i];
        }

        return string(trimmedName);
    }

    function isVowel(bytes1 letter) private pure returns (bool) {
        return (letter == 0x61 || letter == 0x65 || letter == 0x69 || letter == 0x6F || letter == 0x75);
    }

     // Fonction pour récupérer la liste des outils disponibles
    function getAvailableTools() external view returns (Tool[] memory) {
        return tools;
    }

    // Fonction pour récupérer la liste des améliorations d'outil disponibles
    function getAvailableToolUpgrades() external view returns (SpeedUpgrade[] memory) {
        return speedUpgrades;
    }

    // Fonction pour récupérer la liste des améliorations de vitesse de repousse disponibles
    function getAvailableReforestationUpgrades() external view returns (ReforestationUpgrade[] memory) {
        return reforestationUpgrades;
    }
        

       
    
}

