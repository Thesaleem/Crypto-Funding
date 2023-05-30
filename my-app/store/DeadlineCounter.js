

// Get the deadline timestamp from the contract
const deadlineTimestamp = campaign.deadline;

// Function to calculate the remaining time
function calculateRemainingTime() {
  // Get the current timestamp
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Calculate the remaining time in seconds
  const remainingTime = deadlineTimestamp - currentTimestamp;

  // Check if the deadline has passed
  if (remainingTime <= 0) {
    // Display a message or perform any action when the deadline is reached
    document.getElementById('countdown').textContent = 'Deadline reached';
    return;
  }

  // Calculate the remaining days, hours, minutes, and seconds
  const days = Math.floor(remainingTime / (24 * 60 * 60));
  const hours = Math.floor((remainingTime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
  const seconds = remainingTime % 60;

  // Format the remaining time based on the largest unit
  let remainingTimeString = '';
  if (days > 0) {
    remainingTimeString = `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    remainingTimeString = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    remainingTimeString = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    remainingTimeString = `${seconds} second${seconds > 1 ? 's' : ''}`;
  }

  // Update the countdown element with the remaining time
  document.getElementById('countdown').textContent = remainingTimeString;

  // Schedule the next update in 1 second
  setTimeout(calculateRemainingTime, 1000);
}

// Call the function to start the countdown
calculateRemainingTime();