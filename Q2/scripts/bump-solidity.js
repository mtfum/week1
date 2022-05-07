const fs = require('fs');
const solidityRegex = 'pragma solidity ^0.6.11';

const verifierRegex = /contract Verifier/;

for (const s of ['HelloWorldVerifier', 'Multiplier3']) {
	let content = fs.readFileSync(`./contracts/${s}.sol`, {
		encoding: 'utf-8',
	});
	let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
	bumped = bumped.replace(verifierRegex, `contract ${s}`);
	fs.writeFileSync(`./contracts/${s}.sol`, bumped);
}

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment
