
import sodium from 'libsodium-wrappers';

interface PaymentData {
    clientId: string;
    clientRefId: string;
    amount: string;
    returnUrl: string;
    payerFirstName: string;
    payerLastName: string;
    payerAddress: string;
    payerPincode: string;
    payerCity: string;
    payerState: string;
    payerCountry: string;
    payerEmail: string;
    payerContact: string;
}

export interface EncryptedPaymentPayload {
    encryptedData: string;
    nonce: string; // Base64 encoded
    key: string;   // Base64 encoded
}

export async function generatePaymentPayload(data: PaymentData): Promise<EncryptedPaymentPayload> {
    await sodium.ready;

    const PG_ClientID = `PG_ClientID=${data.clientId}`;
    const PG_ClientRefID = `PG_ClientRefID=${data.clientRefId}`;
    const PG_Amount = `PG_Amount=${data.amount}`;
    const PG_ReturnURL = `PG_ReturnURL=${data.returnUrl}`;

    const PG_PayeeFirstname = `PG_PayeeFirstname=${data.payerFirstName}`;
    const PG_PayeeLastname = `PG_PayeeLastname=${data.payerLastName}`;
    const PG_PayeeAddress = `PG_PayeeAddress=${data.payerAddress}`;
    const PG_PayeePincode = `PG_PayeePincode=${data.payerPincode}`;
    const PG_PayeeCity = `PG_PayeeCity=${data.payerCity}`;
    const PG_PayeeState = `PG_PayeeState=${data.payerState}`;
    const PG_PayeeCountry = `PG_PayeeCountry=${data.payerCountry}`;
    const PG_Email = `PG_Email=${data.payerEmail}`;
    const PG_Contact = `PG_Contact=${data.payerContact}`;

    const allData = [
        PG_ClientID,
        PG_ClientRefID,
        PG_Amount,
        PG_ReturnURL,
        PG_PayeeFirstname,
        PG_PayeeLastname,
        PG_PayeeAddress,
        PG_PayeePincode,
        PG_PayeeCity,
        PG_PayeeState,
        PG_PayeeCountry,
        PG_Email,
        PG_Contact
    ].join('|');

    // Generate random key (256-bit / 32 bytes)
    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);

    // Generate random nonce (192-bit / 24 bytes)
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    // Encrypt
    // sodium_crypto_secretbox equivalent in libsodium.js is crypto_secretbox_easy
    const ciphertext = sodium.crypto_secretbox_easy(allData, nonce, key);

    return {
        encryptedData: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL),
        nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
        key: sodium.to_base64(key, sodium.base64_variants.ORIGINAL)
    };
}
