var crypto = require("./crypto.js")
var constants = require("../constants.js")
var slots = require("../time/slots.js")
var options = require('../options')
var bignum = require('../../lib/bignum_utils');

function calculateFee(amount) {
    var min = constants.fees.send;
    
    //bignum update var fee = parseFloat((amount * 0.0001).toFixed(0));
    var fee = bignum.multiply(amount, 0.0001).toFixed(0);

    //bignum update return fee < min ? min : fee;
    if (bignum.isLessThan(fee, min)) {
        return min;
    } else {
        return fee + "";
    }
}

function createTransaction(recipientId, amount, message, secret, secondSecret) {
	var transaction = {
		type: 0,
		nethash: options.get('nethash'),
		amount: amount + "",    //bignum update
		fee: constants.fees.send,
		recipientId: recipientId,
		message: message,
		timestamp: slots.getTime() - options.get('clientDriftSeconds'),
		asset: {}
	};

	var keys = crypto.getKeys(secret);
	transaction.senderPublicKey = keys.publicKey;

	crypto.sign(transaction, keys);

	if (secondSecret) {
		var secondKeys = crypto.getKeys(secondSecret);
		crypto.secondSign(transaction, secondKeys);
	}

	transaction.id = crypto.getId(transaction);
	return transaction;
}

function createLock(height, secret, secondSecret) {
	var transaction = {
		type: 100,
		amount: "0",    //bignum update
		nethash: options.get('nethash'),
		fee: "10000000",    //bignum update
		recipientId: null,
		args: [ String(height) ],
		timestamp: slots.getTime() - options.get('clientDriftSeconds'),
		asset: {}
	};

	var keys = crypto.getKeys(secret);
	transaction.senderPublicKey = keys.publicKey;

	crypto.sign(transaction, keys);

	if (secondSecret) {
		var secondKeys = crypto.getKeys(secondSecret);
		crypto.secondSign(transaction, secondKeys);
	}

	transaction.id = crypto.getId(transaction);
	return transaction;
}

module.exports = {
	createTransaction: createTransaction,
	calculateFee: calculateFee,
	createLock: createLock
}