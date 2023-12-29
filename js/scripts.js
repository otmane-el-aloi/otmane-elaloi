var available_cmd = ["whoAmI", "education", "certification", "experience", "skills", "lang", "contact", "help", "clear"];

// Get the input field
var cmd = document.getElementById("command");

// Execute a function when the user releases a key on the keyboard
cmd.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        run_command();
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
