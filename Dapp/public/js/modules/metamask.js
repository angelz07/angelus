import { checkPlayerRegistration } from './infosPlayerAndParcel';


export function eventOnclickMetamask(){
    $('#connectMetamask').on('click', async function () {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await sendTransaction(window.ethereum.request({ method: 'eth_requestAccounts' }));
                const account = accounts[0];
                $('#walletAddress').text(account).show();
                $('#connectMetamask').hide();
            } catch (error) {
                console.error('Erreur lors de la connexion à MetaMask:', error);
            }
        } else {
            alert("MetaMask n'est pas installé. Veuillez l'installer pour continuer.");
        }
    });
}

export async function checkMetamaskConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await sendTransaction(window.ethereum.request({ method: 'eth_requestAccounts' }));
            const account = accounts[0];
            $('#walletAddress').text(account).show();
            $('#connectMetamask').hide();

            // Vérifiez si le joueur est enregistré
            await checkPlayerRegistration();

        } catch (error) {
            console.error('Erreur lors de la connexion à MetaMask:', error);
            // Masquer le formulaire d'enregistrement si la connexion à MetaMask échoue
            $('#registerPlayer').hide();
            $('#info-container').hide();
        }
    } else {
        alert("MetaMask n'est pas installé. Veuillez l'installer pour continuer.");
        // Masquer le formulaire d'enregistrement si MetaMask n'est pas installé
        $('#registerPlayer').hide();
        $('#info-container').hide();
    }
}




export function showRegistrationForm(visible) {
    if (visible) {
        $('#registerPlayer').show();
        $('#info-container').hide();
    } else {
        $('#registerPlayer').hide();
        $('#info-container').show();
    }
}


export async function sendTransaction(promise) {
    try {
        $('#spinnerContainer').show(); // Affiche le spinner
        await new Promise(resolve => setTimeout(resolve, 0)); // Ajoutez cette ligne pour permettre au navigateur de mettre à jour le DOM
        
        const result = await promise;
        $('#spinnerContainer').hide(); // Cache le spinner
        return result;
    } catch (error) {
        $('#spinnerContainer').hide(); // Cache le spinner
        console.error('Erreur lors de l\'envoi de la transaction:', error);
        throw error;
    }
}