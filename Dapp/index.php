<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Angelus Game</title>
    <link rel="stylesheet" href="public/css/style.css">
    <link rel="stylesheet" href="public/fontawesome/css/all.min.css">
   
</head>
<body>
    <div class="App">
        <header class="App-header">
            <div class="App-header-top">
                <img src="public/img/logo.svg" alt="Logo" class="App-logo">
                <h1>Angelus Game</h1>
                <button class="btn-metamask" id="connectMetamask">Connect to Metamask</button>
                <span class="wallet-address" id="walletAddress" style="display:none;"></span>
            </div>
        </header>
        
        <div class="App-content">
            <div id="registerPlayer" style="display:none;">
                <input type="text" id="playerName" placeholder="Nom du joueur" />
                <button id="registerBtn">Enregistrer</button>
            </div>
            <div class="info-container" id="info-container" style="display:none;">
                <div class="parcel-info-container">
                    parcel
                    <!-- Les divs seront générées dynamiquement ici -->
                </div>
                <div class="player-info-container">
                    <div class="player-info">
                       
                       
                        <!-- Informations -->
                    </div>
                    <div class="player-action-container">
                        <!-- Actions -->
                        <div class="staking-container action_div_class">
                            <input type="number" id="stakingAmount" placeholder="Nombre d'Angelus" min="0" />
                            <button id="stakeBtn">Staker</button>
                            <button id="unstakeBtn">Déstaker</button>
                        </div>
                        <div class="tree-actions-container">
                            <div class="action_div_class">
                                <select id="parcelSelect" class="custom-select">
                                <!-- Les options seront générées dynamiquement -->
                                </select>
                                <button id="cutTreesBtn">Couper les arbres</button>
                            </div>
                            <div class="action_div_class">
                                <select id="listToolsToBuy" class="custom-select">
                                <!-- Les options seront générées dynamiquement -->
                                </select>
                                <button id="buyTools">Acheter Outils</button>
                            </div>
                            <div class="action_div_class">
                                <select id="listBonusReforestationToBuy" class="custom-select">
                                <!-- Les options seront générées dynamiquement -->
                                </select>
                                <button id="buyBonusReforestation">Acheter Bonus Repousse</button>
                            </div>
                          
                            <div class="action_div_class">
                                Amélioration pour <span id="toolsSelectPlayer"></span>
                                <select id="listBonusToolsToBuy" class="custom-select">
                                <!-- Les options seront générées dynamiquement -->
                                </select>
                                <button id="buyBonusTools">Acheter Bonus Outils</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Ajoutez ce div juste avant la fermeture de la balise </body> -->
    <div class="spinner-container" id="spinnerContainer" style="display:none;">
        <i class="fas fa-spinner fa-spin"></i>
    </div>
    <script language="javascript" src="public/js/libs/jquery-3.6.0.min.js"></script>
    <script type="module" src="public/js/main.js"></script>
   

</body>
</html>