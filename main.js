const file='content.enc';	// Path to the encrypted file which contains the content
const latestFile='latest.txt';	// Path to the "latest" plain text file which contains the date and time of the last change of the content
var showLatest = false;	// Boolean for showing or not showing the "latest" info
var inputString = "";	// Initialize the input string

document.addEventListener("DOMContentLoaded", function() {
	displayLatest();
});

// Listen to keypresses (instead of an input field) and start decryption by pressing enter (instead of a button)
document.addEventListener("keypress", function(event) {
	if (event.key === "Enter") {
		decryptfile();
	}

	// Append the typed character to the input string (Only add printable characters, skip Enter, Shift, etc.)
	if (event.key.length === 1) {
		inputString += event.key;
	}
});

// Reads the file of the given path
function readfile(url) {
	return new Promise((resolve, reject) => {
	    	fetch(url)
	      	.then(response => {
	        	if (!response.ok) {
	         		reject(`Failed to fetch file: ${response.status}`);
	        	} else {
	          		return response.arrayBuffer();
	        	}
	      	})
	      	.then(buffer => {
	        	resolve(buffer);
	      	})
	      	.catch(error => {
	        	reject(error);
		});
  	});
}

// Display the footer
function displayFooter() {
    const footer = document.getElementById('footer');
    footer.style.display = 'flex';
}

async function displayLatest() {
	if(getStoredData("showLatest")) {
		var latest = await readfile(latestFile);
		const decoder = new TextDecoder();
		const decodedLatest = decoder.decode(latest);
		const outputElement = document.getElementById('latestOutput');
		outputElement.textContent = decodedLatest;
	}
}

// Store a key and value pair in session storage
function storeData(key, value) {
	sessionStorage.setItem(key, value);
}

// Get the value of the given key from session storage
function getStoredData(key) {
	if(sessionStorage.getItem(key)) {
		return sessionStorage.getItem(key);
	} else {
		return null;
	}
}

// Decryption of the content file
async function decryptfile() {

	var cipherbytes=await readfile(file);
	var cipherbytes=new Uint8Array(cipherbytes);

	var pbkdf2iterations=10000;

	var passphrasebytes=new TextEncoder("utf-8").encode(inputString);
	
	var pbkdf2salt=cipherbytes.slice(8,16);

	var passphrasekey=await window.crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits'])
	.catch(function(err){
		console.error(err);
	});

	var pbkdf2bytes=await window.crypto.subtle.deriveBits({"name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256'}, passphrasekey, 384)		
	.catch(function(err){
		console.error(err);
	});

	pbkdf2bytes=new Uint8Array(pbkdf2bytes);

	keybytes=pbkdf2bytes.slice(0,32);
	ivbytes=pbkdf2bytes.slice(32);
	cipherbytes=cipherbytes.slice(16);

	var key=await window.crypto.subtle.importKey('raw', keybytes, {name: 'AES-CBC', length: 256}, false, ['decrypt']) 
	.catch(function(err){
		console.error(err);
	});

	var plaintextbytes=await window.crypto.subtle.decrypt({name: "AES-CBC", iv: ivbytes}, key, cipherbytes)
	.catch(function(err){
		console.error("Wrong password fool! If it worked before, the password might have changed. Ask me for the new one!");
	});

	if(!plaintextbytes) {
		return;
	}

	plaintextbytes=new Uint8Array(plaintextbytes);

	const decoder = new TextDecoder();
	const decryptedText = decoder.decode(plaintextbytes);
	const outputElement = document.getElementById('decryptedTextOutput');
	outputElement.textContent = decryptedText;

	displayFooter();

	showLatest = true;
	storeData("showLatest", showLatest);
}
