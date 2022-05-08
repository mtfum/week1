const { expect } = require('chai');
const { ethers } = require('hardhat');
const fs = require('fs');
const { groth16, plonk } = require('snarkjs');
const { doesNotThrow } = require('assert');

function unstringifyBigInts(o) {
	if (typeof o == 'string' && /^[0-9]+$/.test(o)) {
		return BigInt(o);
	} else if (typeof o == 'string' && /^0x[0-9a-fA-F]+$/.test(o)) {
		return BigInt(o);
	} else if (Array.isArray(o)) {
		return o.map(unstringifyBigInts);
	} else if (typeof o == 'object') {
		if (o === null) return null;
		const res = {};
		const keys = Object.keys(o);
		keys.forEach((k) => {
			res[k] = unstringifyBigInts(o[k]);
		});
		return res;
	} else {
		return o;
	}
}

describe('HelloWorld', function () {
	let Verifier;
	let verifier;

	beforeEach(async function () {
		Verifier = await ethers.getContractFactory('HelloWorldVerifier');
		verifier = await Verifier.deploy();
		await verifier.deployed();
	});

	it('Should return true for correct proof', async function () {
		//[assignment] Add comments to explain what each line is doing
		// This line passes an object to the Groth16 instance that has a=1 and b=2 as initial values.
		// Also, by passing wasm and zkey, the same as the actual execution environment is reproduced.
		const { proof, publicSignals } = await groth16.fullProve(
			{ a: '1', b: '2' },
			'contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm',
			'contracts/circuits/HelloWorld/circuit_final.zkey'
		);

		console.log('1x2 =', publicSignals[0]);
		// These lines convert the values obtained by probe by unstringifyBigInts defined above.
		// Also, the edited values are used to change the hexadecimal notation
		const editedPublicSignals = unstringifyBigInts(publicSignals);
		const editedProof = unstringifyBigInts(proof);
		const calldata = await groth16.exportSolidityCallData(
			editedProof,
			editedPublicSignals
		);

		// change the resulting calldata to BigInt type
		const argv = calldata
			.replace(/["[\]\s]/g, '')
			.split(',')
			.map((x) => BigInt(x).toString());

		// Prepare each of the variables that the verifier will use for the proof.
		const a = [argv[0], argv[1]];
		const b = [
			[argv[2], argv[3]],
			[argv[4], argv[5]],
		];
		const c = [argv[6], argv[7]];
		const Input = argv.slice(8);
		// Write a method that actually calls the method from the constants created above and passes if the return value is true.
		expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
	});
	it('Should return false for invalid proof', async function () {
		let a = [0, 0];
		let b = [
			[0, 0],
			[0, 0],
		];
		let c = [0, 0];
		let d = [0];
		expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
	});
});

describe('Multiplier3 with Groth16', function () {
	let Verifier;
	let verifier;

	beforeEach(async function () {
		//[assignment] insert your script here
		Verifier = await ethers.getContractFactory('Multiplier3');
		verifier = await Verifier.deploy();
		await verifier.deployed();
	});

	it('Should return true for correct proof', async function () {
		//[assignment] insert your script here
		const { proof, publicSignals } = await groth16.fullProve(
			{ a: '1', b: '2', c: '3' },
			'contracts/circuits/Multiplier3-groth16/Multiplier3_js/Multiplier3.wasm',
			'contracts/circuits/Multiplier3-groth16/circuit_final.zkey'
		);
		const editedPublicSignals = unstringifyBigInts(publicSignals);
		const editedProof = unstringifyBigInts(proof);
		const calldata = await groth16.exportSolidityCallData(
			editedProof,
			editedPublicSignals
		);
		const argv = calldata
			.replace(/["[\]\s]/g, '')
			.split(',')
			.map((x) => BigInt(x).toString());

		const a = [argv[0], argv[1]];
		const b = [
			[argv[2], argv[3]],
			[argv[4], argv[5]],
		];
		const c = [argv[6], argv[7]];
		const Input = argv.slice(8);

		expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
	});
	it('Should return false for invalid proof', async function () {
		//[assignment] insert your script here
		let a = [0, 0];
		let b = [
			[0, 0],
			[0, 0],
		];
		let c = [0, 0];
		let d = [0];
		expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
	});
});

describe('Multiplier3 with PLONK', function () {
	let Verifier;
	let verifier;
	beforeEach(async function () {
		//[assignment] insert your script here
		Verifier = await ethers.getContractFactory('PlonkVerifier');
		verifier = await Verifier.deploy();
		await verifier.deployed();
	});

	it('Should return true for correct proof', async function () {
		//[assignment] insert your script here
		const { proof, publicSignals } = await plonk.fullProve(
			{ a: '1', b: '2', c: '3' },
			'contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm',
			'contracts/circuits/Multiplier3_plonk/circuit_final.zkey'
		);
		const editedPublicSignals = unstringifyBigInts(publicSignals);
		const editedProof = unstringifyBigInts(proof);
		const calldata = await plonk.exportSolidityCallData(
			editedProof,
			editedPublicSignals
		);
		const arg = calldata.split(',');
		expect(await verifier.verifyProof(arg[0], editedPublicSignals)).to.be.true;
	});
	it('Should return false for invalid proof', async function () {
		//[assignment] insert your script here
		let a = '0x00';
		let b = ['0'];
		expect(await verifier.verifyProof(a, b)).to.be.false;
	});
});
