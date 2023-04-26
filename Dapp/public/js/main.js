import { checkMetamaskConnection, eventOnclickMetamask } from './modules/metamask.js';
import { cutTrees, loadContractJSON , angelusGameAddress} from './modules/useAngelusGame.js';
import { registerOnSmartContract, eventOnclickNewPlayer, checkPlayerRegistration } from './modules/infosPlayerAndParcel.js';

import { ethers } from '../js/libs/ethers-5.2.esm.min.js';

$(document).ready(function () {
    eventOnclickMetamask();
    checkMetamaskConnection();
    eventOnclickNewPlayer();
   // eventOnclickAngelusGameStacking();
   // eventOnClickCutTrees();

   $("#cutTreesBtn").on("click", eventOnClickCutTrees);

   setupDebugListener();

   // Appelle la fonction checkPlayerRegistration toutes les minutes (60000 millisecondes)
    setInterval(checkPlayerRegistration, 60000);
});


async function eventOnClickCutTrees() {
    const parcelIndex = $("#parcelSelect").val();
    await cutTrees(parcelIndex);
    // Rechargez les informations du joueur et de la parcelle après avoir coupé les arbres
    checkPlayerRegistration();
}

async function listenToDebugEvents(contract) {
    contract.on("Debug", (message, value, event) => {
      console.log("Debug event received:");
      console.log("Message:", message);
      console.log("Value:", value.toString());
    });
  }
  
  async function setupDebugListener() {
    const contractJSON = await loadContractJSON();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, provider);
  
    listenToDebugEvents(angelusGameContract);
  }