// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import des contrats ERC20 et Ownable d'OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Crée un contrat AngelusToken qui hérite des contrats ERC20 et Ownable
contract AngelusToken is ERC20, Ownable {
    // Variable pour stocker l'adresse du contrat de jeu
    address private gameContract;

    /**
    * Constructeur pour définir le nom, le symbole et l'offre initiale du token
    * @dev Constructeur du contrat AngelusToken.
    * @param initialSupply La quantité initiale de tokens à créer.
    */
    constructor(uint256 initialSupply) ERC20("Angelus Token", "ANGL") {
        _mint(msg.sender, initialSupply);
    }

   

    /**
    * @dev Modificateur pour vérifier que l'appelant est le contrat de jeu
    */
    modifier onlyGameContract() {
        require(msg.sender == gameContract, "Only the game contract can call this function");
        _;
    }

    /**
    * @dev Modificateur pour vérifier que l'appelant est le propriétaire du contrat ou le contrat de jeu
    */
    modifier onlyOwnerOrGameContract() {
        require(msg.sender == owner() || msg.sender == gameContract, "Only owner or game contract can call this function");
        _;
    }

    /**
    * @dev Fonction pour définir l'adresse du contrat de jeu, accessible uniquement par le propriétaire du contrat
    * @param _gameContract L'adresse du contrat de jeu.
    */
   function setGameContract(address _gameContract) external  {
        require(gameContract == address(0), "Game contract has already been set");
        gameContract = _gameContract;
    }

   

    /**
    * @dev Fonction pour créer des tokens et les attribuer à une adresse spécifiée 
    * Accessible uniquement par le propriétaire du contrat ou le contrat de jeu
    * @param to L'adresse qui recevra les tokens.
    * @param amount Le montant de tokens à créer.
    * Accessible uniquement par le contrat de jeu.
    */
    function mint(address to, uint256 amount) external onlyOwnerOrGameContract {
        _mint(to, amount);
    }

    /**
    * @dev Fonction pour détruire (brûler) des tokens d'une adresse spécifiée
    * Accessible uniquement par le propriétaire du contrat ou le contrat de jeu
    * @param from L'adresse qui brule les tokens.
    * @param amount Le montant de tokens à créer.
    * Accessible uniquement par le contrat de jeu.
    */
    function burn(address from, uint256 amount) external onlyOwnerOrGameContract {
        _burn(from, amount);
    }

    
}
