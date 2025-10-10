// Trigger this function on form submit (installable trigger)
function onFormSubmit(e) {
  
  const ss = SpreadsheetApp.openById("1lbPR0gWUhSvNUNZArEUcQ8bnoGwJQcxyAtNRdfqTA-U"); 
  const sheet = ss.getSheetByName("Responses"); // Make sure this matches your tab name exactly




  const values = e.values; // Array of form responses




  // Map columns from the form submission
  const firstName = values[1]; // Column B: First Name
  const phone = values[4];     // Column E: Phone Number (format "123 456 7890")
  const email = values[5];     // Column F: School Email




  const row = sheet.getLastRow(); // Row to update for this submission




  // Define valid email domain and area codes
  const validEmailDomain = "@baruchmail.cuny.edu";
  const validAreaCodes = ["201","203","212","315","329","332","347","363","475","516","518","551","609","624","640","646","680","716","718","732","838","845","848","856","862","908","914","917","929","934","973"];




  // Validate email
  const emailValid = email.toLowerCase().trim().endsWith(validEmailDomain);




  // Format phone number
  const phoneDigits = phone.replace(/\D/g,"");
  const phoneAreaCode = phoneDigits.substring(0,3);
  const phoneValid = validAreaCodes.includes(phoneAreaCode);




  // Process cases
  if(emailValid && phoneValid){
    sheet.getRange(row, 9).setValue("Pending"); // Column I: Verification Status
    sheet.getRange(row, 11).setValue("All good"); // Column K: Notes
    sheet.getRange(row,1,1, sheet.getLastColumn()).setBackground(null); // Clear shading
    sendVerificationEmail(firstName, email, row, sheet);




  } else if(emailValid && !phoneValid){
    sheet.getRange(row, 9).setValue("Pending");
    sheet.getRange(row, 11).setValue("Non-local phone");
    sheet.getRange(row,1,1, sheet.getLastColumn()).setBackground("#FFF59D"); // Yellow
    sendVerificationEmail(firstName, email, row, sheet);




  } else if(!emailValid){
    sheet.getRange(row, 9).setValue("Invalid Email");
    sheet.getRange(row, 11).setValue("Email domain invalid");
    sheet.getRange(row,1,1, sheet.getLastColumn()).setBackground("#EF9A9A"); // Red
    // Do not send email
  }
}




// Generate a random 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}




// Send verification email to the student
function sendVerificationEmail(firstName, email, row, sheet){
  const verificationCode = generateCode();




  // Store verification code and initialize token
  sheet.getRange(row, 8).setValue(verificationCode); // Column H: Verification Code
  sheet.getRange(row, 10).setValue("FALSE");         // Column J: Token Used




  // Verification page URL
  const verificationLink = "https://rawnakc.github.io/isaca-verification/";




  const subject = "ISACA Cybersecurity Club: Verify Your Email";
  const body = `Hi ${firstName},




Thank you for signing up for the ISACA Cybersecurity Club WhatsApp community!




Please verify your email by entering the following 6-digit code on the verification page:




${verificationCode}




Verify here: ${verificationLink}




This code is unique to your submission and should not be shared with anyone else.




If you did not submit this form, please ignore this email. If you have any questions, you may contact isgbaruchwhatsapp@gmail.com.




Thank you!
- ISACA Cybersecurity Club`;




  MailApp.sendEmail(email, subject, body);
}
