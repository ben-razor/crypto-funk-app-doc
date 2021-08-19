var CryptoFunkMarket = artifacts.require("CryptoFunkMarket");

module.exports = function(deployer) {
	deployer.deploy(CryptoFunkMarket, 
		"CRYPTOFUNK",
		"☮",
		"f50027cdefc8f564d4c1fac14b5a656c5e452476e490acac827dd00e5d9b0f8e",
		4
	);
}