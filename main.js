const file='text.txt.enc';

var input = document.getElementById("passwordInput");
input.addEventListener("keypress", function(event) {
	if (event.key === "Enter") {
		decryptfile();
	}
});

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
	        	resolve(buffer);  // resolve with ArrayBuffer
	      	})
	      	.catch(error => {
	        	reject(error);  // handle error
		});
  	});
}

function storeData(key, value) {
	localStorage.setItem(key, value);
}

function getStoredData(key) {
	if(localStorage.getItem(key)) {
		return localStorage.getItem(key);
	} else {
		return null;
	}
}

async function decryptfile() {
	var cipherbytes=await readfile(file);
	var cipherbytes=new Uint8Array(cipherbytes);
	
	var pbkdf2iterations=10000;
	
	var passphrasebytes=new TextEncoder("utf-8").encode(passwordInput.value);
	
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

	var key;

	if(getStoredData("password")) {
		key=getStoredData("password");
	} else {
		key=await window.crypto.subtle.importKey('raw', keybytes, {name: 'AES-CBC', length: 256}, false, ['decrypt']) 
		.catch(function(err){
			console.error(err);
		});
	}

	var plaintextbytes=await window.crypto.subtle.decrypt({name: "AES-CBC", iv: ivbytes}, key, cipherbytes)
	.catch(function(err){
		console.error(err);
	});

	if(!plaintextbytes) {
		return;
	}

	plaintextbytes=new Uint8Array(plaintextbytes);

	const decoder = new TextDecoder();
	const decryptedText = decoder.decode(plaintextbytes);
	const outputElement = document.getElementById('decryptedTextOutput');
	outputElement.textContent = decryptedText;

	storeData("password", key);
}
