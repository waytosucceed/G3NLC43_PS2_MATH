var questions = [];
var i = 0;
var count = 0;
var score = 0;
var Ansgiven = []; // Store answers given by the user
var previousQuestionIndex = null; // Track the previously displayed question
var topicName = ''; // Variable to store the topic name
const submitSound = document.getElementById("submit-sound");

const uniqueKey = "Flip, Turn, Slide and Symmetry";

// Helper function to save data in local storage under the unique key
function saveToLocalStorage(key, value) {
  let storageData = JSON.parse(localStorage.getItem(uniqueKey)) || {};
  storageData[key] = value;
  localStorage.setItem(uniqueKey, JSON.stringify(storageData));
}

// Helper function to get data from local storage under the unique key
function getFromLocalStorage(key) {
  let storageData = JSON.parse(localStorage.getItem(uniqueKey)) || {};
  return storageData[key];
}

// Fetch the questions from the JSON file
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    // Get the selected topic from the URL
    const urlParams = new URLSearchParams(window.location.search);
    topicName = urlParams.get('topic'); // Store topic name for later use

    // Find the questions for the selected topic
    const selectedTopic = data.topics.find(t => t.heading === topicName);

    if (selectedTopic) {
      questions = selectedTopic.questions; // Access the questions array for the selected topic
      const savedAnswers = getFromLocalStorage("Ansgiven");
      if (savedAnswers && Array.isArray(savedAnswers)) {
        Ansgiven = savedAnswers;
      }
      count = questions.length;

      // Store total number of questions in localStorage
      saveToLocalStorage(topicName + '_totalQuestions', count);

      // Load the heading from the selected topic
      document.getElementById('heading').innerText = topicName || 'PS'; // Set default heading if not provided
      loadButtons();
      loadQuestion(i);

      // Store topics in local storage for the results page
      const topics = JSON.parse(localStorage.getItem('topics')) || [];
      if (!topics.find(t => t.heading === topicName)) {
        topics.push(selectedTopic);
        saveToLocalStorage('topics', topics);
      }
    } else {
      document.getElementById('heading').innerText = 'Topic not found';
      document.getElementById('buttonContainer').innerHTML = 'No questions available for this topic.';
    }
  });

function loadButtons() {
  var buttonContainer = document.getElementById("buttonContainer");
  buttonContainer.innerHTML = ""; // Clear previous buttons
  for (var j = 0; j < questions.length; j++) {
    var btn = document.createElement("button");
    btn.className = "btnButton btn  smallbtn";
    btn.innerHTML = "Q" + (j + 1);
    btn.setAttribute("onclick", "abc(" + (j + 1) + ")");

    // Check if the topic has been completed and disable the button if necessary
    if (getFromLocalStorage(topicName + '_completed')) {
      btn.classList.add("disabled-btn");
      btn.disabled = true;
    }

    buttonContainer.appendChild(btn);
  }
  // Highlight the button for the current question
  highlightButton(i);
  // Update button styles based on answered questions
  updateButtonStyles();
}

function loadQuestion(index) {
  var randomQuestion = questions[index];

  if (!randomQuestion) {
    console.error("No question found at index:", index);
    return;
  }

  // Set question text
  var questionElement = document.getElementById("question");
  questionElement.innerHTML = randomQuestion.question; // Set the question text

  // Check if there is a sound associated with the question
  if (randomQuestion.questionSound) {
    var soundButton = document.createElement("button");
    soundButton.className = "btn btn-sound";
    soundButton.innerText = "🔊 Play Sound";
    soundButton.onclick = function () {
      var sound = new Audio(randomQuestion.questionSound);
      sound.play();
    };
    questionElement.appendChild(soundButton);
  }

  // Get the options container
  var optionsElement = document.getElementById("options");
  optionsElement.innerHTML = ""; // Clear existing options

  // Handle inputBox type questions with special layout
  if (randomQuestion.inputBox) {
  document.getElementById("picdiv").classList.remove("col-md-4", "col-lg-4", "col-sm-4", "col-xs-4");
  document.getElementById("picdiv").classList.add("col-12");
  document.getElementById("picdiv").style.backgroundImage = 'none';
  document.getElementById("picdiv").style.boxShadow = 'none';

  // Make questiondiv take more space for input fields
  document.getElementById("questiondiv").classList.add("input");
  document.getElementById("questiondiv").classList.remove("col-md-6", "col-lg-6", "col-sm-6", "col-xs-6");
  document.getElementById("questiondiv").classList.add("col-md-10", "col-lg-10", "col-sm-10", "col-xs-10");

  document.getElementById("question").style.top = '35%';
  document.getElementById("question").style.left = '50%';
  
  // Create the special layout container
  optionsElement.style.display = "flex";
  optionsElement.style.flexDirection = "column";
  optionsElement.style.alignItems = "center";
  optionsElement.style.gap = "20px";
  optionsElement.style.marginTop = "40px";

  let inputCounter = 0;
  const rows = Object.keys(randomQuestion.inputBox);
  
  // Create main container for the entire layout
  const mainContainer = document.createElement("div");
  mainContainer.style.display = "flex";
  mainContainer.style.flexDirection = "column";
  mainContainer.style.alignItems = "center";
  mainContainer.style.gap = "20px";
  mainContainer.style.width = "100%";

  // Step 1: Create pictures row (pic1 and pic2 side by side)
  const picturesRow = document.createElement("div");
  picturesRow.style.display = "flex";
  picturesRow.style.justifyContent = "center";
  picturesRow.style.alignItems = "center";
  picturesRow.style.gap = "50px";
  picturesRow.style.marginBottom = "20px";

  // Collect all pictures from all rows
  rows.forEach((rowKey) => {
    const rowData = randomQuestion.inputBox[rowKey];
    rowData.forEach(item => {
      if (item.pic !== undefined && item.pic !== "") {
        const img = document.createElement("img");
        img.src = item.pic;
        img.style.width = "150px";
        img.style.height = "100px";
        img.style.borderRadius = "8px";
        img.style.border = "2px solid #ddd";
        img.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        
        // Add error handling for image loading
        img.onerror = function() {
          console.error("Failed to load image:", item.pic);
          this.style.display = "none";
        };
        
        picturesRow.appendChild(img);
      }
    });
  });

  // Step 2: Create fractions row (fraction1 = fraction2)
  const fractionsRow = document.createElement("div");
  fractionsRow.style.display = "flex";
  fractionsRow.style.justifyContent = "center";
  fractionsRow.style.alignItems = "center";
  fractionsRow.style.gap = "30px";

  // Process each row to create fractions
  rows.forEach((rowKey, rowIndex) => {
    const rowData = randomQuestion.inputBox[rowKey];
    
    // Create fraction container for this row
    const fractionContainer = document.createElement("div");
    fractionContainer.style.display = "flex";
    fractionContainer.style.flexDirection = "column";
    fractionContainer.style.alignItems = "center";
    fractionContainer.style.gap = "5px";

    // Create numerator - FIXED: Now handles empty numerators
    rowData.forEach(item => {
      if (item.num !== undefined) {
        if (item.num !== "") {
          // Display existing numerator value
          const numSpan = document.createElement("span");
          numSpan.textContent = item.num;
          numSpan.className = "fraction-element";
          numSpan.style.fontSize = "2.5rem";
          numSpan.style.padding = "10px 20px";
          numSpan.style.backgroundColor = "#f8f9fa";
          numSpan.style.borderRadius = "8px";
          numSpan.style.border = "2px solid #e9ecef";
          numSpan.style.minWidth = "80px";
          numSpan.style.textAlign = "center";
          numSpan.style.fontWeight = "bold";
          fractionContainer.appendChild(numSpan);
        } else {
          // Create input field for empty numerator
          const inputField = document.createElement("input");
          inputField.type = "text";
          inputField.id = `input-${inputCounter}`;
          inputField.className = "input-box editable";
          inputField.style.fontSize = "2.5rem";
          inputField.style.padding = "10px 20px";
          inputField.style.width = "100px";
          inputField.style.height = "60px";
          inputField.style.textAlign = "center";
          inputField.style.border = "3px solid #007bff";
          inputField.style.borderRadius = "8px";
          inputField.style.fontWeight = "bold";
          inputField.style.backgroundColor = "#fff";
          inputCounter++;
          
          inputField.oninput = function() {
            document.getElementById("subbtn").style.display = "inline-block";
            document.getElementById("nextbtn").style.display = "none";
          };
          
          fractionContainer.appendChild(inputField);
        }
      }
    });
    
    // Add fraction line
    const line = document.createElement("div");
    line.style.width = "100px";
    line.style.height = "3px";
    line.style.backgroundColor = "#333";
    line.style.margin = "8px 0";
    fractionContainer.appendChild(line);

    // Create denominator - FIXED: Improved handling for empty denominators
    rowData.forEach(item => {
      if (item.dem !== undefined) {
        if (item.dem !== "") {
          // Display existing denominator value
          const demSpan = document.createElement("span");
          demSpan.textContent = item.dem;
          demSpan.className = "fraction-element";
          demSpan.style.fontSize = "2.5rem";
          demSpan.style.padding = "10px 20px";
          demSpan.style.backgroundColor = "#f8f9fa";
          demSpan.style.borderRadius = "8px";
          demSpan.style.border = "2px solid #e9ecef";
          demSpan.style.minWidth = "80px";
          demSpan.style.textAlign = "center";  
          demSpan.style.fontWeight = "bold";
          fractionContainer.appendChild(demSpan);
        } else {
          // Create input field for empty denominator
          const inputField = document.createElement("input");
          inputField.type = "text";
          inputField.id = `input-${inputCounter}`;
          inputField.className = "input-box editable";
          inputField.style.fontSize = "2.5rem";
          inputField.style.padding = "10px 20px";
          inputField.style.width = "100px";
          inputField.style.height = "60px";
          inputField.style.textAlign = "center";
          inputField.style.border = "3px solid #007bff";
          inputField.style.borderRadius = "8px";
          inputField.style.fontWeight = "bold";
          inputField.style.backgroundColor = "#fff";
          inputCounter++;
          
          inputField.oninput = function() {
            document.getElementById("subbtn").style.display = "inline-block";
            document.getElementById("nextbtn").style.display = "none";
          };
          
          fractionContainer.appendChild(inputField);
        }
      }
    });

    // Add fraction container to fractions row
    fractionsRow.appendChild(fractionContainer);

    // Add equals sign between fractions (only after first fraction)
    if (rowIndex === 0 && rows.length > 1) {
      const equalsSign = document.createElement("div");
      equalsSign.textContent = "=";
      equalsSign.style.fontSize = "3rem";
      equalsSign.style.fontWeight = "bold";
      equalsSign.style.color = "#333";
      equalsSign.style.alignSelf = "center";
      fractionsRow.appendChild(equalsSign);
    }
  });

  // Assemble the complete layout
  mainContainer.appendChild(picturesRow);
  mainContainer.appendChild(fractionsRow);
  optionsElement.appendChild(mainContainer);
}else {
    // Handle standard option questions (existing code)
    document.getElementById("picdiv").classList.add("col-md-4", "col-lg-4", "col-sm-4", "col-xs-4");
    document.getElementById("picdiv").classList.remove("col-12");
    document.getElementById("picdiv").style.backgroundImage = "url('./assests/images/background.png')";
    document.getElementById("picdiv").style.boxShadow = 'none';

    document.getElementById("questiondiv").classList.remove("input");
    document.getElementById("questiondiv").classList.add("col-md-6", "col-lg-6", "col-sm-6", "col-xs-6");
    document.getElementById("questiondiv").classList.remove("col-md-10", "col-lg-10", "col-sm-10", "col-xs-10");

    document.getElementById("options").style.display = "flex";
    document.getElementById("options").style.flexDirection = "column"

    document.getElementById("question").style.top = '50%';
    document.getElementById("question").style.left = '50%';
    
    // Handle standard option questions (text or image)
    var hasImageOptions = randomQuestion.options.some(option => option.image);
    var hasTextOnlyOptions = randomQuestion.options.every(option => !option.image);

    // Apply layout based on content
    if (hasImageOptions) {
      optionsElement.classList.add("grid-layout");
      optionsElement.classList.remove("text-only");
    } else if (hasTextOnlyOptions) {
      optionsElement.classList.add("text-only");
      optionsElement.classList.remove("grid-layout");
    }

    var selectedLi = null;

    randomQuestion.options.forEach(function (option, idx) {
      var li = document.createElement("li");
      li.classList.add("option-container");

      li.onclick = function () {
        // Remove the border from previously selected option
        if (selectedLi) {
          selectedLi.style.border = "";
        }

        // Add the border to the clicked option
        li.style.border = "3px solid";
        li.style.borderRadius = "8px";
        selectedLi = li;
      };

      // Create the radio button for the option
      var radioButton = document.createElement("input");
      radioButton.type = "radio";
      radioButton.name = "answer";
      radioButton.value = idx;
      radioButton.style.display = "none"; // Hide the radio button

      if (option.image) {
        var optionWithImage = document.getElementById("options");
        optionWithImage.style.display = "grid";
        optionWithImage.style.gridTemplateColumns = "repeat(2,1fr)";
        optionWithImage.style.gap = "0.5rem";
        var optionImage = document.createElement("img");
        optionImage.src = option.image;
        optionImage.alt = "Option Image";
        optionImage.style.width = "65%";
        optionImage.style.cursor = "pointer";
        optionImage.style.borderRadius = "12px";

        optionImage.onclick = function () {
          radioButton.checked = true;
          handleAnswerChange();
        };

        li.appendChild(optionImage);
      } else {
        var optionTextButton = document.createElement("button");
        optionTextButton.className = "btnOption btn btn-option";
        optionTextButton.textContent = option.text;
        
        optionTextButton.onclick = function () {
          radioButton.checked = true;
          handleAnswerChange();
        };

        li.appendChild(optionTextButton);
      }

      li.appendChild(radioButton);
      optionsElement.appendChild(li);
    });

    // Handle previously selected answer
    var previouslySelected = Ansgiven[index];
    if (previouslySelected !== null && previouslySelected !== undefined) {
      var previouslySelectedElement = optionsElement.querySelector(
        'input[name="answer"][value="' + previouslySelected + '"]'
      );
      if (previouslySelectedElement) {
        previouslySelectedElement.checked = true;
        var previouslySelectedLi = previouslySelectedElement.closest('li');
        if (previouslySelectedLi) {
          previouslySelectedLi.style.border = "3px solid";
          previouslySelectedLi.style.borderRadius = "8px";
          selectedLi = previouslySelectedLi;
        }
      }
    }
  }

  // Update button visibility based on whether an answer is selected
  updateButtonVisibility();
  // Highlight the button for the current question
  highlightButton(index);
  // Update button styles
  updateButtonStyles();
  // Update the Next button or Submit Answers button
  updateButtonText();
}

// Rest of the functions remain the same...
function playOptionSound(option) {
  var sound = new Audio(option);
  sound.play();
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getOptionLabel(option) {
  if (option.endsWith('.mp3')) {
    var label = option.split('/').pop().replace('.mp3', '');
    return capitalizeFirstLetter(label);
  }
  return option;
}

function handleAnswerChange() {
  // Display the Submit Answer button when an answer is selected
  document.getElementById("subbtn").style.display = "inline-block";
  document.getElementById("nextbtn").style.display = "none";
}

function newques() {
  // Save the answer for the current question
  saveCurrentAnswer();

  if (i === count - 1) {
    document.getElementById("questiondiv").style.textAlign = "center";
    
    // Display results
    displayResults();    
  
    // Hide buttonContainer
    document.getElementById("buttonContainer").style.display = "none";
  } else {
    // Move to the next question
    i++;
    loadQuestion(i);
    document.getElementById("result").innerHTML = "";
    document.getElementById("subbtn").style.display = "inline-block";
    document.getElementById("nextbtn").style.display = "none";
    
    // Update button visibility and styles
    updateButtonVisibility();
    updateButtonStyles();
  }
}

// Save the answer for the current question
function saveCurrentAnswer() {
  var questionType = questions[i]; // Current question

  if (questionType.inputBox) {
    // Save input box values
    var inputValues = [];
    let allEmpty = true; // Flag to check if all input fields are empty
    let inputCounter = 0;
    
    // Loop through all input fields regardless of row structure
    for (const rowKey in questionType.inputBox) {
      questionType.inputBox[rowKey].forEach(item => {
        // Check for empty numerator or denominator or operand fields
        if ((item.num !== undefined && item.num === "") || 
            (item.dem !== undefined && item.dem === "") || 
            (item.operand !== undefined && item.operand === "")) {
          var inputField = document.getElementById(`input-${inputCounter}`);
          if (inputField) {
            let value = inputField.value.trim(); // Trim spaces
            inputValues.push(value);
            if (value !== "") {
              allEmpty = false; // Mark as not empty if any field has a value
            }
          }
          inputCounter++;
        }
      });
    }

    // If all inputs are empty, mark the question as unanswered
    if (allEmpty) {
      Ansgiven[i] = null; // Mark as unanswered
    } else {
      // Save user-entered values to the `Ansgiven` array
      Ansgiven[i] = inputValues;
    }
  } else {
    // Save selected options for standard questions
    var selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
      Ansgiven[i] = parseInt(selectedAnswer.value); // Save the index of the selected answer
    } else {
      Ansgiven[i] = null; // Mark as unanswered
    }
  }

  // Save answers to local storage
  saveToLocalStorage("Ansgiven", Ansgiven);
  console.log("Saved answers:", Ansgiven);
}

function displayResults() {
  // Save the current answer before displaying results
  saveCurrentAnswer();

  // Normalize function to handle input comparison
  function normalizeAnswer(answer) {
    if (Array.isArray(answer)) {
      return answer.map(a => String(a).trim().toLowerCase());
    }
    return String(answer).trim().toLowerCase();
  }

  // Calculate the final score
  let finalScore = Ansgiven.reduce((total, answer, index) => {
    let question = questions[index];

    if (!question) {
      console.warn(`Missing question data for index ${index}`);
      return total;
    }

    if (question.inputBox) {
      // Handle input box questions
      let correctAnswers = question.answer; // Correct answers array
      let userAnswers = Array.isArray(answer) ? answer : []; // User's answers as array
      
      // Compare only the number of answers we're expecting
      let isCorrect = true;
      for (let i = 0; i < correctAnswers.length; i++) {
        if (i >= userAnswers.length || 
            normalizeAnswer(userAnswers[i]) !== normalizeAnswer(correctAnswers[i])) {
          isCorrect = false;
          break;
        }
      }

      return isCorrect ? total + 1 : total;
    } else {
      // Handle standard option-based questions
      return answer === question.answer ? total + 1 : total;
    }
  }, 0);

  saveToLocalStorage(topicName + "_score", finalScore);
  saveToLocalStorage(topicName + "_completed", "true");

  let percentage = (finalScore / questions.length) * 100;

  // Prepare content for graph.html or display page
  let questionContent = "";
  let questionsPerPage = 5;
  let numberOfPages = Math.ceil(questions.length / questionsPerPage);

  // Iterate through the pages of questions
  for (let page = 0; page < numberOfPages; page++) {
    let start = page * questionsPerPage;
    let end = Math.min(start + questionsPerPage, questions.length);

    let pageDiv = `<div class='question-page' style='display: ${
      page === 0 ? "block" : "none"
    };'><h2>Page ${page + 1}</h2>`;

    for (let j = start; j < end; j++) {
      let quesgroup = questions[j];
      if (!quesgroup) continue;

      let ques = quesgroup.question;

      // Handle correct answers
      let ansContent = "";
      if (quesgroup.inputBox) {
        ansContent = Array.isArray(quesgroup.answer)
          ? quesgroup.answer.join(", ") // Display multiple correct answers
          : quesgroup.answer;
      } else {
        let correctAnswerOption = quesgroup.options[quesgroup.answer];
        if (correctAnswerOption) {
          if (correctAnswerOption.image) {
            ansContent = `<img src='${correctAnswerOption.image}' alt='Correct Answer Image' style='width: 50px; height: 50px;'>`;
          } else {
            ansContent = getOptionLabel(correctAnswerOption); // Extract text label for the option
          }
        } else {
          ansContent = "Not Available"; // Fallback if no correct answer is set
        }
      }

      // Handle user's given answer
      let givenAnswer = Ansgiven[j] !== undefined ? Ansgiven[j] : "Not Answered";
      let givenContent = "";
      let isAnswerCorrect = false;

      // Check if the answer is correct
      if (quesgroup.inputBox) {
        // For input box questions
        let correctAnswers = quesgroup.answer;
        let userAnswers = Array.isArray(givenAnswer) ? givenAnswer : [];
        
        isAnswerCorrect = true;
        for (let i = 0; i < correctAnswers.length; i++) {
          if (i >= userAnswers.length || 
              normalizeAnswer(userAnswers[i]) !== normalizeAnswer(correctAnswers[i])) {
            isAnswerCorrect = false;
            break;
          }
        }
        
        givenContent = Array.isArray(givenAnswer)
          ? givenAnswer.join(", ")
          : "Not Answered";
      } else {
        // For option-based questions
        isAnswerCorrect = givenAnswer === quesgroup.answer;
        
        let givenAnsOption = quesgroup.options[givenAnswer];
        if (givenAnsOption) {
          if (givenAnsOption.image) {
            givenContent = `<img src='${givenAnsOption.image}' alt='Given Answer Image' style='width: 50px; height: 50px;'>`;
          } else {
            givenContent = getOptionLabel(givenAnsOption);
          }
        } else {
          givenContent = "Not Answered";
        }
      }

      // Apply red color if answer is incorrect or not answered
      let answerStyle = isAnswerCorrect ? "" : "color: red; font-weight: bold;";

      let num = j + 1;
      pageDiv += `Q.${num} ${ques}<br>Correct Answer: ${ansContent}<br>Answer Given: <span style="${answerStyle}">${givenContent}</span><br><br>`;
    }

    pageDiv += "</div>";
    questionContent += pageDiv;
  }

  // Add pagination controls
  let paginationControls = "<div class='pagination-controls' style='text-align: center; margin-top: 20px;'>";
  paginationControls += "</div>";

  questionContent += paginationControls;

  // Save content for graph.html
  saveToLocalStorage(topicName + "_results_content", questionContent);

  // Redirect to the graph page
  window.location.href = "./graph.html";
}

// Helper function to extract option label
function getOptionLabel(option) {
  return option.text || "No Label"; // Fallback to "No Label" if text is not defined
}

// Helper function to show the appropriate page in the results
function showPage(page) {
  let pages = document.querySelectorAll('.question-page');
  pages.forEach((p, index) => {
    p.style.display = index === page ? 'block' : 'none';
  });
}

function checkAnswer() {
  submitSound.play();

  saveCurrentAnswer(); // Save the current input before checking

  var question = questions[i];
  var isCorrect = false;

  if (question.inputBox) {
    // Validate input box answers
    var correctAnswers = question.answer; // Correct answers array
    var userAnswers = Ansgiven[i] || [];

    // Compare user answers with correct answers
    isCorrect = userAnswers.length === correctAnswers.length &&
      userAnswers.every((val, idx) => val === correctAnswers[idx]);

    if (isCorrect) {
      score++; // Increment the score if the answer is correct
    }
  } else {
    // Validate standard option-based answers
    isCorrect = Ansgiven[i] === question.answer;

    if (isCorrect) {
      score++; // Increment the score if the answer is correct
    }
  }

  console.log("Current score:", score);

  document.getElementById("subbtn").style.display = "none";
  document.getElementById("nextbtn").style.display = "inline-block";
}

function abc(x) {
  // Save the current answer before changing questions
  saveCurrentAnswer();
  i = x - 1;
  loadQuestion(i);
  document.getElementById("result").innerHTML = "";
  document.getElementById("subbtn").style.display = "inline-block";
  document.getElementById("nextbtn").style.display = "none";

  // Update button styles and visibility
  highlightButton(i);
  updateButtonStyles();
}

function updateButtonVisibility() {
  var selectedAnswer = document.querySelector('input[name="answer"]:checked');
  if (selectedAnswer) {
    document.getElementById("subbtn").style.display = "inline-block";
    document.getElementById("nextbtn").style.display = "none";
  } else {
    document.getElementById("subbtn").style.display = "none";
    document.getElementById("nextbtn").style.display = "none";
  }
}

function highlightButton(index) {
  var buttonContainer = document.getElementById("buttonContainer");
  var buttons = buttonContainer.getElementsByTagName("button");

  // Remove highlight from all buttons
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("highlighted-btn");
  }

  // Add highlight to the current button
  if (index >= 0 && index < buttons.length) {
    buttons[index].classList.add("highlighted-btn");
  }
}

function updateButtonStyles() {
  var buttonContainer = document.getElementById("buttonContainer");
  
  if (buttonContainer) {
    var buttons = buttonContainer.getElementsByTagName("button");

    // Remove "answered-btn" class from all buttons
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].classList.remove("answered-btn");
    }

    // Add "answered-btn" class to the button for the answered questions
    Ansgiven.forEach((answer, index) => {
      if (answer !== null && index >= 0 && index < buttons.length) {
        buttons[index].classList.add("answered-btn");
      }
    });
  } else {
    console.error("Button container not found");
  }
}


function updateButtonText() {
  var nextButton = document.getElementById("nextbtn");
  if (i === count - 1) {
    nextButton.innerHTML = "Submit Homework";
    nextButton.onclick = function() {
      newques(); // Calls newques which will hide buttonContainer
    };

  } else {
    nextButton.innerHTML = "Next";
   
  }
}


