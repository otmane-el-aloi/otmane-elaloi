var available_cmd = ["education", "certifications", "experiences", "skills", "languages", "contacts", "help", "clear"];
var executedCommands = []; // Array to store executed commands
var currentCommandIndex = 0; // Index for navigating through executed commands

// Get the input field
var cmd = document.getElementById("command");


cmd.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        run_command();
    }

    // Number 38 is the "Arrow Up" key on the keyboard
    if (event.keyCode === 38) {
        // Prevent the default action
        event.preventDefault();
        
        // Display the previous command
        if (currentCommandIndex > 0) {
            currentCommandIndex--;
            cmd.value = executedCommands[currentCommandIndex];
        }
    }

    // Number 40 is the "Arrow Down" key on the keyboard
    if (event.keyCode === 40) {
        // Prevent the default action
        event.preventDefault();
        
        // Display the next command
        if (currentCommandIndex < executedCommands.length - 1) {
            currentCommandIndex++;
            cmd.value = executedCommands[currentCommandIndex];
        } else {
            // If at the end of the executed commands, display an empty input
            currentCommandIndex = executedCommands.length;
            cmd.value = '';
        }
    }
});

cmd.addEventListener("keydown", function(event) {
    // Number 9 is the "Tab" key on the keyboard
    if (event.keyCode === 9) {
        // Prevent the default action (e.g., tabbing to the next element)
        event.preventDefault();
        
        // Get the current value in the input field
        var inputValue = cmd.value;
        
        // Find the matching command
        var matchingCmd = available_cmd.find(function(command) {
            return command.startsWith(inputValue);
        });
        
        // If a matching command is found, autocomplete it in the input field
        if (matchingCmd) {
            cmd.value = matchingCmd;
        }
    }
});



document.getElementById('resume-container').addEventListener('click', function (event) {
    // Check if the clicked element is not the input itself
    if (event.target !== document.getElementById('command')) {
      // Set focus on the input
      document.getElementById('command').focus();
    }
});

function run_command() {
    var cmd = document.getElementById("command");
    var input = cmd.value;
    var output;

    // Store executed commands in the array
    executedCommands.push(input);
    currentCommandIndex = executedCommands.length;

    if (input != '') {
        // Get command from input field 
        var element = document.getElementById(input);

        // Error command, if command not found
        if (available_cmd.indexOf(input) < 0)
            element = document.getElementById('error');

        if (input == 'clear') {
            document.getElementById("executed_commands").innerHTML = `<pre>
                            ██     ████   ██ ██████      █████ ███    ███    ██ 
                            ██     ████   ████    ██    ██   ██████  ████    ██ 
                            ██  █  ███████████    ██    █████████ ████ ██    ██ 
                            ██ ███ ████   ████    ██    ██   ████  ██  ██    ██ 
                             ███ ███ ██   ██ ██████     ██   ████      ██    ██ 
              </pre> <div> 🔥Enter <i>help</i> to get list of all available commands</div>`;
            document.getElementById("command").value = "";
            return;
        }

        // Create a clone to show as command output
        output = element.cloneNode(true);
        output.style = "display:block";
    }

    // Get command output in HTML format
    var cmd_output = document.createElement("div");
    var container = document.createElement("div");
    var node = document.createTextNode(">> " + input);

    cmd_output.appendChild(container);
    container.appendChild(node);

    if (input != '') {
        cmd_output.appendChild(output);
    }

    // Append the command output to the executed commands div container
    var element = document.getElementById("executed_commands");
    element.appendChild(cmd_output);

    // Clear the command input field
    cmd.value = "";

    // Scroll to the end
    var scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
}
