'use strict';

/////////////////////
// Variables 
////////////////////
const display = document.querySelector('.displayScreen');
const buttonContainer = document.getElementById('buttonContainer');
const buttons = document.querySelectorAll('.btn');
const regexOperators = /([+\-*/^])/;

let displayLength = display.innerHTML.length;
//Limit Character Limit
let charLimit = 12;
//Flag tracking if the decimal button has been pressed
let decimalAdded = false;
//Flag tracking button values pressed
let currentValue = '';
//Flag for if the first button pressed is either a number/ minus  
let firstButtonPressed = true;
//Flag tracking the previously pressed value
let lastValuePushed = '';

display.innerHTML = '0'


//////////////////////////////////
// Calculator Display Functions
/////////////////////////////////

let updateDisplay = (value) => {
	if (/[0-9]/.test(value)) {
		// Reset decimalAdded flag when a number is added
		decimalAdded = false;
	}
	if (value === '.' && decimalAdded) {
		return;
	}
	if (value === '.') {
		decimalAdded = true;
	}

	display.innerHTML += value;
	
};

let clearLastChar = () => {
  display.innerHTML = display.innerHTML.slice(0, -1);
  currentValue = currentValue.slice(0, -1);
  
  if(display.innerHTML.indexOf('.') === -1) {
    decimalAdded = false;
  }

  if (display.innerHTML.length === 0) {
		display.innerHTML = '0';
		currentValue = '';
		lastValuePushed = '';
		firstButtonPressed = true;
  } else {
  }
}

let clearDisplay = () => {
  display.innerHTML = '0';
  currentValue = '';
	lastValuePushed = '';
	firstButtonPressed = true;
}


///////////////////////////////
// Calculation/Math Functions
//////////////////////////////

let calculateResult = (expression) => {
	const tokens = expression
		.split(regexOperators)
		.filter((t) => t.trim() !== '');
	const newTokens = [];
	const operatorStack = [];
	const numberStack = [];

	//Checking if there are any '-' before a number
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i] === '-') {
			//AND if the newTokens[] is empty or if the previous tokens[i] is an operator
			if (
				newTokens.length === 0 || /([+*/^])/.test(newTokens[newTokens.length - 1])
			) {
				//Combine the '-' with the following number token
				let negNumberString = '-' + tokens[i + 1];
				newTokens.push(negNumberString);
				i++; // Skip to the next token
			} else {
				//else push the next token
				newTokens.push(tokens[i]);
			}
		} else {
			//else push the next token
			newTokens.push(tokens[i]);
		}
	}

	//Precedence
	const precedenceMap = {
		'^': 3,
		'*': 2,
		'/': 2,
		'+': 1,
		'-': 1,
	};

	
	//Loop through the newTokens[]
	for (let i = 0; i < newTokens.length; i++) {
		const newToken = newTokens[i];
		let negativeNumCheck = Math.sign(newToken) === -1;

		//if the operator exists and is not a negative number
		if (negativeNumCheck === false && regexOperators.test(newToken) && newTokens[i] !== newTokens[0]
		) {
			//Check the operator, handle precedence, and calculate
			while (
				operatorStack.length > 0 &&
				precedenceMap[operatorStack[operatorStack.length - 1]] >=
					precedenceMap[newToken]
			) {
				const operator = operatorStack.pop();
				const b = numberStack.pop();
				const a = numberStack.pop();
				const result = applyEquation(operator, a, b);
				//Push result to numberStack[]
				numberStack.push(result);
			}
			// Push operator token to operatorStack[]
			operatorStack.push(newToken);
		} else {
			// Push number token to numberStack[]
			numberStack.push(parseFloat(newToken));
		}
	}

	//Calculate the remaining operators in operatorStack[]
	while (operatorStack.length > 0) {
		const operator = operatorStack.pop();
		const b = numberStack.pop();
		const a = numberStack.pop();
		const result = applyEquation(operator, a, b);
		numberStack.push(result);
	}

	//Display the result on the calculator screen and update currentValue
	display.innerHTML = numberStack[0].toString()
	return (currentValue = numberStack[0].toString());
};

// Math Equations
let add = (a, b) =>  a+b;

let subtract = (a, b) => a-b;

let multiply = (a, b) => a*b;

let divide = (a, b) => {
	return a/b;
};

let exponent = (a, b) => {
	let result = Math.pow(a, b);
	return result;
};

//Apply the Math
let applyEquation = (operator, a, b) => {
	switch (operator) {
		case '+':
			return add(a, b);
		case '-':
			return subtract(a, b);
		case '*':
			return multiply(a, b);
		case '/':
			return divide(a, b);
		case '^':
			return exponent(a, b);
	}
};

/////////////////////
// Event Listeners
////////////////////

// Mouse button clicks
buttons.forEach((button) => {
	button.addEventListener('click', () => {
		const value = button.innerHTML;
		if(display.innerHTML == '0' && currentValue == '') {
			display.innerHTML = ''
		}
		
		if (value === 'C') {
			clearDisplay();
		} else if (value === 'CE') {
			clearLastChar();
		} else if (value === '=') {
			currentValue = currentValue
				.replace(/−/g, '-')
				.replace(/×/g, '*')
				.replace(/÷/g, '/')
				.replace(/∧/g, '^');
			calculateResult(currentValue);
		} else if (lastValuePushed == '' && /[+*×÷/^∧]/.test(value)) {
			 //Only allow minus operator if lastValuePushed is empty
			firstButtonPressed = false;
			return;
		} else if (
			(lastValuePushed == value && isNaN(value)) ||
			(lastValuePushed === '−' && /[+*×÷/^∧]/.test(value)) ||
			(/[+*×÷/^∧]/.test(value) && /[+*×÷/^∧]/.test(lastValuePushed)) 
		) {
			//avoid operator repeats and consecutive operators
			return;
		}else if (currentValue.length < charLimit) {
			currentValue += value; // Update currentValue
			lastValuePushed = value; // Update lastValuePushed
			updateDisplay(value); // Update display
		}
	});
});


//Keyboard Events
document.addEventListener('keypress', e => {
  e.preventDefault();
  const key = e.key;
	if (display.innerHTML == '0' && currentValue == '') {
		display.innerHTML = '';
	}
	console.log(key)
  
  if (
		/[0-9+\-*/.^]/.test(key) ||
		key === 'Enter' ||
		key === '=' ||
		key === 'Backspace' 
  ) {

		if (key === 'Enter' || key === '=') {
			calculateResult(currentValue);
		} else if (key === 'Backspace') {
			clearLastChar();
		} else if (lastValuePushed == '' && /[+*×÷/^∧]/.test(key)) {
			//Only allow minus operator if lastValuePushed is empty
			firstButtonPressed == false;
			return;
		} else if (
			(lastValuePushed == key && isNaN(key)) ||
			(lastValuePushed === '−' && /[+*×÷/^∧]/.test(key)) ||
			(/[+*×÷/^∧]/.test(key) && /[+*×÷/^∧]/.test(lastValuePushed))
		) {
			//avoid operator repeats and consecutive operators
			return;
		} else if (currentValue.length < charLimit) {
			currentValue += key; // Update currentValue
			lastValuePushed = key; // Update lastValuePushed
			updateDisplay(key); // Update display
		}
  } 
})


