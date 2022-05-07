pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier2 () {
   signal input a;
   signal input b;
   signal output c;

   c <== a * b;
}

template Multiplier3 () {

   // Declaration of signals.
   signal input a;
   signal input b;
   signal input c;
   signal output d;

   component multiplier1 = Multiplier2();
   component multiplier2 = Multiplier2();

   // // Constraints.
   multiplier1.a <== a;
   multiplier1.b <== b;
   multiplier2.a <== multiplier1.c;
   multiplier2.b <== c;
}

component main = Multiplier3();