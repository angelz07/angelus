import { ethers } from '../libs/ethers-5.2.esm.min.js';
import { showRegistrationForm, sendTransaction } from './metamask.js';
import { loadContractJSON } from './useAngelusGame.js';
import config from '../config.js';


const angelusGameAddress = config.angelusGameAddress;


export async function registerOnSmartContract(playerName) {
    // Chargez le JSON si nécessaire
    const contractJSON = await loadContractJSON();
    const playerAddress = $('#walletAddress').text();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);
   
    try {
        //const tx = await angelusGameContract.register(ethers.utils.formatBytes32String(playerName));
        const playerNameBytes = ethers.utils.toUtf8Bytes(playerName);
        const tx = await sendTransaction(angelusGameContract.register(ethers.utils.formatBytes32String(playerName), { from: playerAddress }));
        await tx.wait();
        alert('Enregistrement réussi !');
        showRegistrationForm(false);

        // Récupérer les informations utilisateur et les informations parcel
        const playerInfoTuple = await angelusGameContract.getPlayerInfo(signer.getAddress());

        const playerInfo = {
            name: ethers.utils.parseBytes32String(playerInfoTuple[0]),
            registrationTime: playerInfoTuple[1].toString(),
            cutTrees: playerInfoTuple[2].toString(),
            angelusBalance: playerInfoTuple[3].toString(),
            stakedAngelus: playerInfoTuple[4].toString(),
            unclaimedRewards: playerInfoTuple[5].toString(),
            lastUpdateTimeClaimRewards: playerInfoTuple[6].toString()
        };

        console.log('Informations utilisateur:', playerInfo);

        const parcelInfo = await angelusGameContract.getPlayerParcels(signer.getAddress());
        console.log('Informations parcel:', parcelInfo);
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement sur le smart contract:', error);
        alert('L\'enregistrement a échoué.');
    }
}


export async function checkPlayerRegistration() {
    const contractJSON = await loadContractJSON();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);
   
    try {
        const isPlayerRegistered = await angelusGameContract.isRegistered(signer.getAddress());

        if (isPlayerRegistered) {
            showRegistrationForm(false);
            // Récupérer les informations utilisateur et les informations parcel
            const playerInfoTuple = await angelusGameContract.getPlayerInfo(signer.getAddress());
            
            const playerInfo = {
                name: ethers.utils.parseBytes32String(playerInfoTuple[0]),
                registrationTime: playerInfoTuple[1].toString(),
                cutTrees: playerInfoTuple[2].toString(),
                angelusBalance: playerInfoTuple[3].toString(),
                stakedAngelus: playerInfoTuple[4].toString(),
                unclaimedRewards: playerInfoTuple[5].toString(),
                lastUpdateTimeClaimRewards: playerInfoTuple[6].toString(),
                toolId: playerInfoTuple[7].toString(), // Hache simple par défaut
                reforestationUpgradeId: playerInfoTuple[8].toString()
            };
            
            console.log('Informations utilisateur:', playerInfo);

            const parcelInfo = await angelusGameContract.getPlayerParcels(signer.getAddress());
                
            console.log('Informations parcel:', parcelInfo);

            // Mettre à jour le DOM avec les informations utilisateur et parcel
            showUserInfo(playerInfo);
            showParcelInfo(parcelInfo);
        } else {
            showRegistrationForm(true);
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de l'enregistrement du joueur:", error);
    }
}



export function eventOnclickNewPlayer() {
    
    $('#registerBtn').on('click', async function () {
        
        const playerName = $('#playerName').val().trim();

        if (playerName === '') {
            alert('Veuillez entrer un nom de joueur.');
        } else {
            await registerOnSmartContract(playerName);
        }
    });
}



export async function showUserInfo(playerInfo) {
    console.log('Informations utilisateur:', playerInfo);
    // Affichez les informations utilisateur dans la div .player-info
    // Vous pouvez ajouter plus de détails selon les données de la structure Player
    console.dir(playerInfo)
    let lastRewardTime;
    if(playerInfo.lastUpdateTimeClaimRewards == "0"){
        lastRewardTime = "";
    }
    else{
        lastRewardTime = new Date(Number(playerInfo.lastUpdateTimeClaimRewards) * 1000).toLocaleString()
    }

    let balanceAngelus = ethers.utils.formatUnits(playerInfo.angelusBalance.toString(), 18);

    let toolsHTML;
    if(playerInfo.toolId == 0){
        toolsHTML = '<i class="fal fa-axe"></i>';
    }
    $('#toolsSelectPlayer').html(toolsHTML);
    
    $('.player-info').html(`
    <div class="player-info-row"> 
      
      <span>Angelus Balance : ${balanceAngelus.toString()}&nbsp;|&nbsp;</span>
      <span>Angelus Stacké : ${playerInfo.stakedAngelus.toString()}</span>
      <span>Angelus Rewards : ${playerInfo.unclaimedRewards.toString()}</span>
      <span>Last Time Rewards : ${lastRewardTime}</span>
    </div> 
    <div class="player-info-row"> 
        <span>Player : ${playerInfo.name}&nbsp;|&nbsp;</span>  
        <span><i class="far fa-registered"></i><i class="fal fa-clock"></i> ${new Date(Number(playerInfo.registrationTime) * 1000).toLocaleString()}&nbsp;|&nbsp;</span>
        <span><i class="fal fa-axe"></i><i class="fas fa-trees"></i> ${playerInfo.cutTrees.toString()}&nbsp;|&nbsp;</span>
        <span>Outils ${toolsHTML}&nbsp;|&nbsp;</span>
        <span>Bonus Repousse ${playerInfo.reforestationUpgradeId.toString()}&nbsp;|&nbsp;</span>
      
    </div> 
  `);
}

//



export async function showParcelInfo(parcelInfo) {
    console.log('Informations parcelle:', parcelInfo);
  
    // Affichez les informations de la parcelle dans la div .parcel-info
    // Vous pouvez ajouter plus de détails selon les données de la structure Parcel
    let parcelHTML = '';
    let parcelSelectOptionsHTML = '';
    for (let i = 0; i < parcelInfo.length; i++) {
        let trees = parcelInfo[i].trees.toString();
        let parcelClass = '';
    
        parcelSelectOptionsHTML += `<option value="${parcelInfo[i].id.toString()}">${parcelInfo[i].name.toString()}</option>`;

        if (trees == 900) {
            parcelClass = 'trees-900';
        } else if (trees == 200) {
            parcelClass = 'trees-200';
        } else if (trees < 200) {
            parcelClass = 'trees-less-200';
        }
        let timeUntilCutInSeconds = parseInt(parcelInfo[i].timeUntilCut.toString());
        let timeUntilCutInHours = Math.floor(timeUntilCutInSeconds / 3600);
        let timeUntilCutInMinutes = Math.floor((timeUntilCutInSeconds % 3600) / 60);
        parcelHTML += `
            <div  class="parcel-item ${parcelClass}">
                <h4>Name : ${parcelInfo[i].name.toString()}</h4>
                <!--<p>ID : ${parcelInfo[i].id.toString()}</p>-->
                <input type="hidden" id="${parcelInfo[i].id.toString()}" name="" value="${parcelInfo[i].id.toString()}">
                
                <p><i class="far fa-history"></i><i class="fal fa-axe"></i> ${new Date(parcelInfo[i].lastCutTime.toNumber() * 1000).toLocaleString()}</p>
                <p><i class="far fa-history"></i><i class="fad fa-tree-alt"></i> ${new Date(parcelInfo[i].lastGrowthTime.toNumber() * 1000).toLocaleString()}</p>
                <p><i class="fas fa-trees"></i> ${parcelInfo[i].trees.toString()}</p>
                
                <p><i class="fas fa-arrow-to-top"></i><i class="fas fa-trees"></i> ${parcelInfo[i].maxTrees.toString()}</p>
                <p><i class="far fa-arrow-circle-right"></i><i class="fas fa-trees"></i> ${timeUntilCutInHours + " heures " + timeUntilCutInMinutes + " minutes"}</p>
            </div>
        `;
    }
    $('#parcelSelect').html(parcelSelectOptionsHTML);
    $('.parcel-info-container').html(parcelHTML);
    await loadTools();
    await loadBonusReforestation();
    await loadBonusTools();
}


export async function loadTools() {
    // Chargez le JSON si nécessaire
    const contractJSON = await loadContractJSON();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);

    try {
        const toolsCount = await angelusGameContract.getAvailableTools();
        let toolsOptionsHTML = '';

        for (let i = 0; i < toolsCount.length; i++) {
            const tool = toolsCount[i];
            if(tool.id != 0){
                toolsOptionsHTML += `<option value="${tool.id}">${tool.name} - Prix: ${tool.price} ANG</option>`;
            }
            
        }
        $('#listToolsToBuy').html(toolsOptionsHTML);
    } catch (error) {
        console.error("Erreur lors du chargement des outils:", error);
    }
}

export async function loadBonusReforestation() {
    // Chargez le JSON si nécessaire
    const contractJSON = await loadContractJSON();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);

    try {
        const bonusCount = await angelusGameContract.getAvailableReforestationUpgrades();
       
        let bonusOptionsHTML = '';

        for (let i = 0; i < bonusCount.length; i++) {
            const bonus = bonusCount[i];
            bonusOptionsHTML += `<option value="${bonus.id}">${bonus.name} - Prix: ${bonus.price} ANG</option>`;
        }

        $('#listBonusReforestationToBuy').html(bonusOptionsHTML);
    } catch (error) {
        console.error("Erreur lors du chargement des bonus de repousse:", error);
    }
}

export async function loadBonusTools() {
    // Chargez le JSON si nécessaire
    const contractJSON = await loadContractJSON();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);

    try {
        const bonusCountTools = await angelusGameContract.getAvailableToolUpgrades();
        console.log(bonusCountTools)
        let bonusOptionsHTML = '';

        for (let i = 0; i < bonusCountTools.length; i++) {
            const bonus = bonusCountTools[i];
            bonusOptionsHTML += `<option value="${bonus.id}">${bonus.name} - Prix: ${bonus.price} ANG</option>`;
        }

        $('#listBonusToolsToBuy').html(bonusOptionsHTML);
    } catch (error) {
        console.error("Erreur lors du chargement des bonus de outils:", error);
    }
}
