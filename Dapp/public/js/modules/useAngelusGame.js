import { ethers } from '../libs/ethers-5.2.esm.min.js';
import { showRegistrationForm } from './metamask.js';
import { checkPlayerRegistration } from './infosPlayerAndParcel.js';
import config from '../config.js';


export const angelusGameAddress = config.angelusGameAddress;
export const angelusTokenAddress = config.angelusToken;

export async function loadContractJSON() {
    const baseUrl = window.location.origin;
    const jsonPath = '/public/js/modules/contracts/AngelusGame.json';
    const response = await fetch(baseUrl + jsonPath);
    const contractJSON = await response.json();
    return contractJSON;
}

export async function loadContractTokenJSON() {
    const baseUrl = window.location.origin;
    const jsonPath = '/public/js/modules/contracts/AngelusToken.json';
    const response = await fetch(baseUrl + jsonPath);
    const contractTokebJSON = await response.json();
    return contractTokebJSON;
}

// useAngelusGame.js

export async function cutTrees(parcelIndex) {
    const contractJSON = await loadContractJSON();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);

    try {
        await angelusGameContract.cutTrees(parcelIndex);
        console.log(`Arbres coupés dans la parcelle ${parcelIndex}`);
    } catch (error) {
        console.error("Erreur lors de la coupe des arbres:", error);
    }
}

/*
export function eventOnclickAngelusGameStacking() {
    
    $('#stakeBtn').on('click', async function () {
        const amount = $("#stakingAmount").val();
        if (amount > 0) {
            await stakeAngelus(amount);
        } else {
            alert("Veuillez entrer un montant supérieur à 0.");
        }
    });


    $('#unstakeBtn').on('click', async function () {
        const amount = $("#stakingAmount").val();
        if (amount > 0) {
            await unstakeAngelus(amount);
        } else {
            alert("Veuillez entrer un montant supérieur à 0.");
        }
    });


}


export function eventOnClickCutTrees() {
    $("#cutTreesBtn").on("click", async function () {
        
        const parcelIndex = $("#parcelSelect").val();
        alert(parcelIndex)
        if (parcelIndex === null) {
            alert("Pas de Parcel selectioné");
        }
        else{
            await cutTreesOnSmartContract(parcelIndex);
        }
    });
}

export async function cutTreesOnSmartContract(parcelIndex) {
    // Chargez le JSON si nécessaire
    const contractJSON = await loadContractJSON();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);

    try {
       // const tx = await angelusGameContract.cutTrees(parcelIndex);
        const tx = await angelusGameContract.cutTrees(0, { gasLimit: 2000000 });
        await tx.wait();
        alert("Arbres coupés avec succès!");
        // Récupérer à nouveau les informations utilisateur et les informations parcel
        await checkPlayerRegistration();
    } catch (error) {
        console.error("Erreur lors de la coupe des arbres sur le smart contract:", error);
        alert("La coupe des arbres a échoué.");
    }
}



export async function stakeAngelus(amount) {
    const contractJSON = await loadContractJSON();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);
    const owner = await signer.getAddress();

    try {
        const neededAllowance = ethers.utils.parseUnits(amount, 18);
        const currentAllowance = await getAngelusAllowance(owner, angelusGameAddress);
        console.log("currentAllowance : " + currentAllowance.toString())
        if (currentAllowance.lt(neededAllowance)) {
            await approveAngelusTokens(angelusGameAddress, amount);
        }

        console.log("Nouvelle allowance après approbation :");
const newAllowance = await getAngelusAllowance(owner, angelusGameAddress);
console.log(newAllowance.toString());

        const tx = await angelusGameContract.stakeAngelus(neededAllowance);
        let rep = await tx.wait();
        console.dir(rep)
        alert("Angelus staké avec succès !");
        await checkPlayerRegistration();
    } catch (error) {
        console.error("Erreur lors du staking des Angelus :", error);
        alert("Le staking a échoué.");
    }
}

export async function unstakeAngelus(amount) {
    const contractJSON = await loadContractJSON();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const angelusGameContract = new ethers.Contract(angelusGameAddress, contractJSON.abi, signer);
    const owner = await signer.getAddress();

    try {
        const neededAllowance = ethers.utils.parseUnits(amount, 18);
        const currentAllowance = await getAngelusAllowance(owner, angelusGameAddress);
        console.log("currentAllowance : " + currentAllowance.toString())
       // if (currentAllowance.lt(neededAllowance)) {
            await approveAngelusTokens(angelusGameAddress, amount);
        //}
        
        const tx = await angelusGameContract.unstakeAngelus(neededAllowance);
        await tx.wait();
        alert("Angelus déstaké avec succès !");
        await checkPlayerRegistration();
    } catch (error) {
        console.error("Erreur lors du unstaking des Angelus :", error);
        alert("Le unstaking a échoué.");
    }
}



async function getAngelusAllowance(owner, spender) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractTokenJSON = await loadContractTokenJSON();
    // Remplacez ces variables par les informations réelles
    const angelusTokenAbi = contractTokenJSON.abi; // ABI du contrat intelligent ERC20 des tokens Angelus
  
    const angelusTokenContract = new ethers.Contract(angelusTokenAddress, angelusTokenAbi, provider);
    
    const allowance = await angelusTokenContract.allowance(owner, spender);
    return allowance;
  }

  */
  /*
  async function approveAngelusTokens(spender, amount) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractTokenJSON = await loadContractTokenJSON();
    const signer = provider.getSigner();
  
    // Remplacez ces variables par les informations réelles
    
    const angelusTokenAbi = contractTokenJSON.abi; // ABI du contrat intelligent ERC20 des tokens Angelus
  
    const angelusTokenContract = new ethers.Contract(angelusTokenAddress, angelusTokenAbi, signer);
  
    // Convertissez le montant en unités les plus petites (si nécessaire)
    const smallestUnitsAmount = ethers.utils.parseUnits(amount, 18);
  
    // Approuvez le contrat de staking pour dépenser vos tokens Angelus
    const tx = await angelusTokenContract.approve(spender, smallestUnitsAmount);
    await tx.wait();

    console.log('Tokens Angelus approuvés');
    console.log(tx)
  }
  */
/*
  async function approveAngelusTokens(spender, amount) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractTokenJSON = await loadContractTokenJSON();
    const signer = provider.getSigner();

    const angelusTokenAbi = contractTokenJSON.abi;

    const angelusTokenContract = new ethers.Contract(angelusTokenAddress, angelusTokenAbi, signer);


     // Ajout de l'écouteur d'événement ici
     angelusTokenContract.on("Approval", (owner, spender, value, event) => {
        console.log("Événement Approval:");
        console.log("Owner:", owner);
        console.log("Spender:", spender);
        console.log("Value:", value.toString());
      });


    const smallestUnitsAmount = ethers.utils.parseUnits(amount, 18); // Retirer la multiplication par 2

    const tx = await angelusTokenContract.approve(spender, smallestUnitsAmount);
    await tx.wait();

    console.log('Tokens Angelus approuvés');
    console.log(tx)
}*/