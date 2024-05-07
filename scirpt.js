import CryptoJS from "crypto-js";


const hashedPass = CryptoJS.SHA512("123456").toString(CryptoJS.enc.Hex);

console.log(hashedPass)