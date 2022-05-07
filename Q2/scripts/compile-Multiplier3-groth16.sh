#!/bin/bash

# [assignment] create your own bash script to compile Multiplier3.circom modeling after compile-HelloWorld.sh below

cd contracts/circuits

mkdir Multiplier3-groth16

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
  echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
  echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compilong Multiplier3.circom"

circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3-groth16
snarkjs r1cs info Multiplier3-groth16/Multiplier3.r1cs

snarkjs groth16 setup Multiplier3-groth16/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3-groth16/circuit_0000.zkey
snarkjs zkey contribute Multiplier3-groth16/circuit_0000.zkey Multiplier3-groth16/circuit_final.zkey --name="1st Contributor name" -v -e="random text"
snarkjs zkey export verificationkey Multiplier3-groth16/circuit_final.zkey Multiplier3-groth16/verification_key.json

snarkjs zkey export solidityverifier Multiplier3-groth16/circuit_final.zkey ../Multiplier3.sol