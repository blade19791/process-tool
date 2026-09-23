const totalSteps = 100;
let currentStep = 0;

function drawProgressBar(step, total) {
  const percentage = Math.floor((step / total) * 100);
  const barLength = 20; // Length of the bar in characters
  const completedLength = Math.round((percentage / 100) * barLength);

  // Create the loading bar visual
  const bar =
    "█".repeat(completedLength) + "░".repeat(barLength - completedLength);

  // Clear the line and move the cursor to the beginning
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  // Print the progress bar
  process.stdout.write(`Progress: [${bar}] ${percentage}%`);
}

// Simulate a long-running task
const timer = setInterval(() => {
  currentStep++;
  drawProgressBar(currentStep, totalSteps);

  if (currentStep >= totalSteps) {
    clearInterval(timer);
    console.log("\nTask complete! 🎉");
  }
}, 50);
